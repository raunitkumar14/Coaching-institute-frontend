import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';

type Phase = 'idle' | 'recording' | 'uploading' | 'error';

// Staggered delays for 20 waveform bars — symmetric pattern
const WAVE_DELAYS = [0, 0.08, 0.16, 0.24, 0.32, 0.40, 0.32, 0.24, 0.16, 0.08,
                     0, 0.08, 0.16, 0.24, 0.32, 0.40, 0.32, 0.24, 0.16, 0.08];

function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function uploadToS3(url: string, blob: Blob, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', 'audio/webm');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`S3 ${xhr.status}`));
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(blob);
  });
}

export default function AudioRecorder() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('idle');
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const elapsedRef = useRef(0);
  const sessionRef = useRef<{ session_id: string; presigned_url: string; s3_key: string } | null>(null);

  const isRecording = phase === 'recording';
  const isUploading = phase === 'uploading';
  const formDisabled = isRecording || isUploading;
  const canStart = studentName.trim() !== '' && studentPhone.trim() !== '';

  async function startRecording() {
    setError('');

    // Step 1: obtain presigned URL before touching the mic
    try {
      const body: Record<string, string> = {
        student_name: studentName,
        student_phone: studentPhone,
      };
      if (studentEmail.trim()) body.student_email = studentEmail.trim();
      const { data } = await api.post<{ session_id: string; presigned_url: string; s3_key: string }>(
        '/api/conversations/upload-url',
        body
      );
      sessionRef.current = data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string; message?: string } } };
      const msg = e?.response?.data?.detail || e?.response?.data?.message || 'Failed to prepare upload. Please try again.';
      setError(msg);
      return;
    }

    // Step 2: start MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(250);
      elapsedRef.current = 0;
      setElapsed(0);
      setPhase('recording');
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
      }, 1000);
    } catch {
      sessionRef.current = null;
      setError('Microphone access denied. Please allow microphone access in your browser and try again.');
    }
  }

  async function stopRecording() {
    if (!mediaRecorderRef.current) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const mr = mediaRecorderRef.current;
    const durationSeconds = elapsedRef.current;
    await new Promise<void>((resolve) => { mr.onstop = () => resolve(); mr.stop(); });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    await uploadRecording(blob, durationSeconds);
  }

  async function uploadRecording(blob: Blob, durationSeconds: number) {
    const session = sessionRef.current;
    if (!session) {
      setError('Session data missing. Please try again.');
      setPhase('error');
      return;
    }
    setPhase('uploading');
    setUploadProgress(0);
    setError('');
    try {
      setUploadStep('Uploading audio…');
      await uploadToS3(session.presigned_url, blob, setUploadProgress);
      setUploadStep('Saving conversation…');
      setUploadProgress(100);
      await api.post('/api/conversations', {
        session_id: session.session_id,
        s3_key: session.s3_key,
        duration_seconds: durationSeconds,
      });
      router.push(`/conversation/${session.session_id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string; message?: string } } };
      const msg = e?.response?.data?.detail || e?.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      setPhase('error');
    }
  }

  function reset() {
    setPhase('idle');
    setElapsed(0);
    setUploadProgress(0);
    setUploadStep('');
    setError('');
    sessionRef.current = null;
  }

  return (
    <div className="space-y-5">
      {/* ── Student Information Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-l-4 border-blue-600 px-6 py-5">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
            Student Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Full Name <span className="text-red-500 normal-case tracking-normal">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                disabled={formDisabled}
                placeholder="e.g. Priya Sharma"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white
                           disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Phone <span className="text-red-500 normal-case tracking-normal">*</span>
              </label>
              <input
                type="tel"
                required
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                disabled={formDisabled}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white
                           disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email{' '}
                <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                disabled={formDisabled}
                placeholder="student@example.com"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white
                           disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Recording Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Recording</h2>
        </div>

        <div className="px-6 py-10 flex flex-col items-center gap-6">

          {/* ── IDLE ── */}
          {(phase === 'idle' || phase === 'error') && (
            <>
              <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0014 0" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-800">Ready to Record</p>
                <p className="mt-1 text-sm text-gray-400">
                  {canStart
                    ? 'Click below to start the counseling session'
                    : 'Fill in student name and phone number first'}
                </p>
              </div>
              <button
                onClick={startRecording}
                disabled={!canStart}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-700
                           text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                Start Recording
              </button>
            </>
          )}

          {/* ── RECORDING ── */}
          {isRecording && (
            <>
              {/* Pulsing circle */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-24 h-24 rounded-full bg-red-400 opacity-20 animate-ping" />
                <span className="absolute w-20 h-20 rounded-full bg-red-400 opacity-25 animate-ping" style={{ animationDelay: '200ms' }} />
                <div className="relative z-10 w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                  <span className="w-5 h-5 rounded-sm bg-white" />
                </div>
              </div>

              {/* Timer */}
              <div className="text-5xl font-mono font-bold text-gray-900 tabular-nums tracking-tight">
                {formatTime(elapsed)}
              </div>

              {/* Waveform bars */}
              <div className="flex items-center gap-[3px] h-10">
                {WAVE_DELAYS.map((delay, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-red-400 origin-bottom"
                    style={{
                      height: '100%',
                      animation: `wave-bar 0.7s ease-in-out infinite alternate`,
                      animationDelay: `${delay}s`,
                    }}
                  />
                ))}
              </div>

              {/* Stop button */}
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-red-600 hover:bg-red-700
                           text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <span className="w-3 h-3 rounded-sm bg-white" />
                Stop Recording
              </button>
            </>
          )}

          {/* ── UPLOADING ── */}
          {isUploading && (
            <div className="w-full max-w-xs flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">{uploadStep}</p>
                <p className="text-xs text-gray-400 mt-0.5">{uploadProgress}% complete</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {error && (
            <div className="w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-3">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 text-sm text-red-700">{error}</div>
              <button
                onClick={reset}
                className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

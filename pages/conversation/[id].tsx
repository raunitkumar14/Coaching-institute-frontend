import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';
import { Conversation, User } from '@/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function ConversationDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (stored) setUser(JSON.parse(stored) as User);
  }, []);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    api.get<Conversation>(`/api/conversations/${id}`)
      .then((r) => setConversation(r.data))
      .catch(() => setError('Failed to load conversation. Please try again.'))
      .finally(() => setLoading(false));

    setAudioLoading(true);
    api.get<{ audio_url: string }>(`/api/conversations/${id}/audio`)
      .then((r) => {
        console.log('[audio] response data:', r.data);
        setAudioUrl(r.data.audio_url);
      })
      .catch((err) => {
        console.error('[audio] fetch error:', err);
        setAudioError('Failed to load audio.');
      })
      .finally(() => setAudioLoading(false));
  }, [id]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar */}
        <header className="bg-white border-b border-gray-200 shrink-0">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z" />
                  <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900 tracking-tight">Coaching Institute</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
                </svg>
                Dashboard
              </button>
              {user && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm text-gray-400">Loading conversation…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Conversation detail */}
          {!loading && conversation && (
            <div className="space-y-5">
              {/* Back link */}
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Back to Dashboard
              </button>

              {/* Student info card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-l-4 border-blue-600 px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">{conversation.student_name}</h1>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013.09 4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.13.96.36 1.9.71 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 7l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.58 2.81.71A2 2 0 0122 16.92z" />
                          </svg>
                          {conversation.student_phone}
                        </span>
                        {conversation.student_email && (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                            {conversation.student_email}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {formatDate(conversation.created_at)}
                        </span>
                        {conversation.duration_seconds > 0 && (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {formatDuration(conversation.duration_seconds)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 pt-0.5">
                      <StatusBadge status={conversation.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio player card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">Recording</h2>
                {audioLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Loading audio…
                  </div>
                )}
                {!audioLoading && audioError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                    {audioError}
                  </div>
                )}
                {!audioLoading && audioUrl && (
                  <audio
                    controls
                    src={audioUrl}
                    style={{ width: '100%', minHeight: '40px', display: 'block' }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                )}
                {!audioLoading && !audioError && !audioUrl && (
                  <p className="text-sm text-gray-400">Audio not available.</p>
                )}
              </div>

              {/* Status-specific content */}
              {conversation.status === 'uploaded' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-6 py-5 flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">Audio uploaded successfully!</p>
                    <p className="mt-0.5 text-sm text-yellow-700">Transcription will begin shortly.</p>
                  </div>
                </div>
              )}

              {conversation.status === 'completed' && conversation.summary && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Summary</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">{conversation.summary.executive_summary}</p>
                  </div>

                  {conversation.summary.student_interests.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
                      <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Student Interests</h2>
                      <ul className="space-y-1.5">
                        {conversation.summary.student_interests.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {conversation.summary.follow_up_actions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
                      <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Follow-up Actions</h2>
                      <ul className="space-y-1.5">
                        {conversation.summary.follow_up_actions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {(conversation.status === 'transcribing' || conversation.status === 'transcribed' || conversation.status === 'summarizing') && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-8 flex flex-col items-center gap-3">
                  <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <p className="text-sm text-gray-500">Processing your recording — this usually takes a few minutes.</p>
                </div>
              )}

              {conversation.status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-red-800">Processing failed</p>
                    <p className="mt-0.5 text-sm text-red-700">There was an error processing this recording. Please contact support.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

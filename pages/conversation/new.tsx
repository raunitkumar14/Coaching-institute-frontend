import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import AudioRecorder from '@/components/AudioRecorder';
import api from '@/lib/api';
import { User } from '@/types';

interface Lead {
  lead_id: string;
  name: string;
  phone: string;
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export default function NewConversationPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [leadIdInput, setLeadIdInput] = useState('');
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    api.get<User>('/api/auth/me').then((r) => setUser(r.data)).catch(() => {});
  }, []);

  // Pre-populate from URL query params (passed from dashboard modal)
  useEffect(() => {
    if (!router.isReady) return;
    const { lead_id, name, phone } = router.query;
    if (lead_id && name && phone) {
      setLead({
        lead_id: String(lead_id),
        name: String(name),
        phone: String(phone),
      });
      setFetchState('success');
    }
  }, [router.isReady, router.query]);

  async function fetchLead() {
    if (!leadIdInput.trim()) return;
    setFetchState('loading');
    setLead(null);
    try {
      const { data } = await api.get<Lead>(`/api/leads/${leadIdInput.trim()}`);
      setLead({ lead_id: data.lead_id, name: data.name, phone: data.phone });
      setFetchState('success');
    } catch {
      setFetchState('error');
    }
  }

  function handleLeadIdKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') fetchLead();
  }

  function logout() {
    localStorage.removeItem('user');
    router.push('/login');
  }

  // True when lead data came from URL params (no manual fetch needed)
  const fromParams = !!(router.query.lead_id && router.query.name && router.query.phone);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar */}
        <header className="bg-brand-navy shrink-0 shadow-md">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z" />
                  <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight leading-none block">Mentors Eduserv</span>
                <span className="text-[9px] font-semibold text-brand-accent tracking-widest uppercase leading-none">JEE | NEET | FOUNDATION</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-300 hover:text-white transition flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
                </svg>
                Dashboard
              </button>
              {user && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-200">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs font-semibold text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400
                               rounded-md px-2.5 py-1 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Conversation</h1>
            <p className="mt-1 text-sm text-gray-500">Start recording the counseling session.</p>
          </div>

          {/* ── Lead ID Lookup Card — only shown when not coming from modal ── */}
          {!fromParams && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-l-4 border-brand-primary px-6 py-5">
                <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">Fetch Lead from CRM</h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={leadIdInput}
                    onChange={(e) => {
                      setLeadIdInput(e.target.value);
                      setFetchState('idle');
                      setLead(null);
                    }}
                    onKeyDown={handleLeadIdKeyDown}
                    placeholder="Enter 8-digit Lead ID"
                    disabled={fetchState === 'loading'}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={fetchLead}
                    disabled={fetchState === 'loading' || !leadIdInput.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-accent
                               text-white text-sm font-semibold shadow-sm transition
                               focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fetchState === 'loading' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Fetching…
                      </>
                    ) : 'Fetch Lead'}
                  </button>
                </div>

                {fetchState === 'error' && (
                  <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                    Lead not found. Please check the Lead ID.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Lead Found card ── */}
          {fetchState === 'success' && lead && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-l-4 border-green-500 px-6 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Lead Found</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Student Name</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Lead ID</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.lead_id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Phone</p>
                    <p className="text-sm font-semibold text-gray-900">{lead.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Recording (only after lead fetched) ── */}
          {fetchState === 'success' && lead && (
            <AudioRecorder
              lead_id={lead.lead_id}
              student_name={lead.name}
              student_phone={lead.phone}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

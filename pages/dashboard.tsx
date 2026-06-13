import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationCard from '@/components/ConversationCard';
import api from '@/lib/api';
import { Conversation, User } from '@/types';

interface Lead {
  lead_id: string;
  name: string;
  phone: string;
}

type ModalFetchState = 'idle' | 'loading' | 'error';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalLeadId, setModalLeadId] = useState('');
  const [modalFetchState, setModalFetchState] = useState<ModalFetchState>('idle');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (stored) setUser(JSON.parse(stored) as User);
  }, []);

  useEffect(() => {
    api.get<Conversation[]>('/api/conversations')
      .then((r) => setConversations(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem('user');
    router.push('/login');
  }

  function openModal() {
    setModalLeadId('');
    setModalFetchState('idle');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  async function handleModalFetch() {
    if (!modalLeadId.trim()) return;
    setModalFetchState('loading');
    try {
      const { data } = await api.get<Lead>(`/api/leads/${modalLeadId.trim()}`);
      setShowModal(false);
      router.push(
        `/conversation/new?lead_id=${encodeURIComponent(data.lead_id)}&name=${encodeURIComponent(data.name)}&phone=${encodeURIComponent(data.phone)}`
      );
    } catch {
      setModalFetchState('error');
    }
  }

  function handleModalKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleModalFetch();
    if (e.key === 'Escape') closeModal();
  }

  function handleDeleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar */}
        <header className="bg-brand-navy shrink-0 shadow-md">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            {/* Brand */}
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

            {/* Right: user + logout */}
            <div className="flex items-center gap-3">
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
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-0.5 text-sm text-gray-500">Your counseling sessions</p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-accent text-white text-sm font-semibold shadow-sm transition
                         focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Conversation
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg className="w-8 h-8 text-brand-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm text-gray-400">Loading conversations…</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && conversations.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0014 0" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="8" y1="22" x2="16" y2="22" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900">No conversations yet</h2>
                <p className="mt-1.5 text-sm text-gray-400 max-w-xs">Start by recording your first counseling session</p>
                <button
                  onClick={openModal}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-accent text-white text-sm font-semibold shadow-sm transition
                             focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Start Recording
                </button>
              </div>
            </div>
          )}

          {/* Conversation list */}
          {!loading && conversations.length > 0 && (
            <div className="space-y-3">
              {conversations.map((c) => (
                <ConversationCard
                  key={c.id}
                  conversation={c}
                  onDelete={handleDeleteConversation}
                />
              ))}
            </div>
          )}
        </main>

        {/* ── Lead Fetch Modal ── */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">New Conversation</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">Enter the Lead ID to fetch student details.</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  autoFocus
                  value={modalLeadId}
                  onChange={(e) => { setModalLeadId(e.target.value); setModalFetchState('idle'); }}
                  onKeyDown={handleModalKeyDown}
                  placeholder="8-digit Lead ID"
                  disabled={modalFetchState === 'loading'}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition
                             disabled:opacity-50"
                />
                <button
                  onClick={handleModalFetch}
                  disabled={modalFetchState === 'loading' || !modalLeadId.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-accent
                             text-white text-sm font-semibold transition
                             focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalFetchState === 'loading' ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : 'Fetch Lead'}
                </button>
              </div>

              {modalFetchState === 'error' && (
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
      </div>
    </ProtectedRoute>
  );
}

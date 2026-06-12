import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationCard from '@/components/ConversationCard';
import api from '@/lib/api';
import { Conversation, User } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

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

            {/* User avatar */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-200">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          {/* Page header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-0.5 text-sm text-gray-500">Your counseling sessions</p>
            </div>
            <button
              onClick={() => router.push('/conversation/new')}
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
                <p className="mt-1.5 text-sm text-gray-400 max-w-xs">
                  Start by recording your first counseling session
                </p>
                <button
                  onClick={() => router.push('/conversation/new')}
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
                <ConversationCard key={c.id} conversation={c} />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

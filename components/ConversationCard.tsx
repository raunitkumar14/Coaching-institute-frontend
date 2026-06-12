import { useRouter } from 'next/router';
import StatusBadge from '@/components/StatusBadge';
import { Conversation } from '@/types';

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

interface Props {
  conversation: Conversation;
}

export default function ConversationCard({ conversation }: Props) {
  const router = useRouter();
  const preview = conversation.status === 'completed' && conversation.summary?.executive_summary
    ? conversation.summary.executive_summary.slice(0, 100) + (conversation.summary.executive_summary.length > 100 ? '…' : '')
    : null;

  return (
    <button
      onClick={() => router.push(`/conversation/${conversation.id}`)}
      className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4
                 hover:shadow-md hover:border-brand-primary transition-all duration-150 focus:outline-none
                 focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{conversation.student_name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013.09 4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.13.96.36 1.9.71 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 7l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.58 2.81.71A2 2 0 0122 16.92z" />
              </svg>
              {conversation.student_phone}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDate(conversation.created_at)}
            </span>
            {conversation.duration_seconds > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatDuration(conversation.duration_seconds)}
              </span>
            )}
          </div>
          {preview && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-2">{preview}</p>
          )}
        </div>
        <div className="shrink-0 pt-0.5">
          <StatusBadge status={conversation.status} />
        </div>
      </div>
    </button>
  );
}

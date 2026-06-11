import { StatusEnum } from '@/types';

const CONFIG: Record<StatusEnum, { label: string; className: string }> = {
  recording:    { label: 'Recording',    className: 'bg-blue-100 text-blue-700' },
  uploading:    { label: 'Uploading',    className: 'bg-yellow-100 text-yellow-700' },
  uploaded:     { label: 'Uploaded',     className: 'bg-yellow-100 text-yellow-700' },
  transcribing: { label: 'Transcribing', className: 'bg-orange-100 text-orange-700' },
  transcribed:  { label: 'Transcribed',  className: 'bg-orange-100 text-orange-700' },
  summarizing:  { label: 'Summarizing',  className: 'bg-purple-100 text-purple-700' },
  completed:    { label: 'Completed',    className: 'bg-green-100 text-green-700' },
  error:        { label: 'Error',        className: 'bg-red-100 text-red-700' },
};

interface Props {
  status: StatusEnum;
}

export default function StatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

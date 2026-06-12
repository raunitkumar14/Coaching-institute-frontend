import { StatusEnum } from '@/types';

const CONFIG: Record<StatusEnum, { label: string; className: string }> = {
  recording: { label: 'Recording', className: 'bg-brand-muted text-brand-primary' },
  uploading: { label: 'Uploading', className: 'bg-yellow-100 text-yellow-700' },
  uploaded:  { label: 'Uploaded',  className: 'bg-yellow-100 text-yellow-700' },
  error:     { label: 'Error',     className: 'bg-red-100 text-red-700' },
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

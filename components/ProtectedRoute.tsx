import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { User } from '@/types';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    api.get<User>('/api/auth/me')
      .then(({ data }) => {
        localStorage.setItem('user', JSON.stringify(data));
        setVerified(true);
      })
      .catch(() => {
        localStorage.removeItem('user');
        router.replace('/login');
      });
  }, [router]);

  if (!verified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <svg className="w-8 h-8 text-brand-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="text-sm text-gray-400">Verifying session…</p>
      </div>
    );
  }

  return <>{children}</>;
}

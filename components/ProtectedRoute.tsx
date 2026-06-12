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

  if (!verified) return null;
  return <>{children}</>;
}

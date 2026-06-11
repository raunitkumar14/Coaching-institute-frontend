import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
// TODO: restore real auth — import api from '@/lib/api'
import { User } from '@/types';

interface Props {
  children: React.ReactNode;
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  return stored ? (JSON.parse(stored) as User) : null;
}

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // TODO: restore — api.get('/api/auth/me'), redirect on 401
  useEffect(() => {
    if (!mounted) return;
    const user = getStoredUser();
    if (!user) router.replace('/login');
  }, [mounted, router]);

  if (!mounted) return null;
  if (!getStoredUser()) return null;
  return <>{children}</>;
}

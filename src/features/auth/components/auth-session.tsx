import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { applySession, useSession } from '@/features/auth/api/session';

export function AuthSession() {
  const session = useSession();
  const client = useQueryClient();
  useEffect(() => {
    if (session.data !== undefined) applySession(client, session.data);
  }, [client, session.data]);
  return null;
}

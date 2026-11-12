import { useEffect, useRef, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { toast } from '@/components/custom/toast';

interface RoleGuardProps {
  children: ReactNode;
}

export function RoleGuard({ children }: Readonly<RoleGuardProps>) {
  const hasShownRedirectToast = useRef(false);
  const isAuthenticated = !useAuthStore(
    (state) => state.status === 'authenticated',
  );

  useEffect(() => {
    if (isAuthenticated || hasShownRedirectToast.current) return;

    hasShownRedirectToast.current = true;
    toast.error('ابتدا باید وارد شوید.');
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

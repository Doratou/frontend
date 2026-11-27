import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/custom/loading-button';
import { authApi } from '@/features/auth/api/auth-api';
import { useAuthMutation } from '@/features/auth/hooks/use-auth-mutation';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export function AuthAccountActions() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const logout = useAuthMutation((_: void, signal) => authApi.logout(signal));
  if (!user) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" disabled={logout.isPending}>
        <Link to="/change-password">تغییر رمز عبور</Link>
      </Button>
      <LoadingButton
        variant="ghost"
        isLoading={logout.isPending}
        onClick={() =>
          logout.mutate(undefined, {
            onSettled: () => void navigate('/login', { replace: true }),
          })
        }
      >
        خروج
      </LoadingButton>
    </div>
  );
}

import { CircleAlert } from 'lucide-react';
import { EmptyState } from '@/components/custom/empty-state';
import { LoadingButton } from '@/components/custom/loading-button';
import { getApiErrorMessage } from '@/lib/api/error';

interface ErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  error,
  title = 'دریافت اطلاعات انجام نشد',
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <EmptyState
      role="alert"
      title={title}
      description={getApiErrorMessage(error)}
      icon={<CircleAlert />}
      action={
        onRetry && (
          <LoadingButton
            variant="outline"
            onClick={onRetry}
            isLoading={isRetrying}
            loadingText="در حال تلاش…"
          >
            تلاش دوباره
          </LoadingButton>
        )
      }
    />
  );
}

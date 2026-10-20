import { Spinner } from '@/components/ui/spinner';

export function PageLoading() {
  return (
    <p
      role="status"
      className="flex items-center justify-center gap-3 p-8 text-center text-muted-foreground"
    >
      <Spinner aria-hidden="true" />
      در حال بارگذاری…
    </p>
  );
}

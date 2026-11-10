import { BarChart2, Plus } from 'lucide-react';
import { EmptyState } from '@/components/custom/empty-state';
import { ErrorState } from '@/components/custom/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePolls } from '@/features/poll/api/get-polls';
import { useCurrentGroupId } from '@/features/poll/hooks/use-current-group-id';
import { cn } from '@/lib/utils';
import { PollCard } from './poll-card';
import type { Poll } from '@/features/poll/types';

const gridClass = 'grid gap-4 md:grid-cols-2 xl:grid-cols-3';

function PollSection({
  title,
  polls,
  dotClass,
}: {
  title: string;
  polls: Poll[];
  dotClass: string;
}) {
  if (polls.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-heading-6 text-primary-80">
        <span
          aria-hidden="true"
          className={cn('size-2 rounded-full', dotClass)}
        />
        {title}
      </h2>
      <div className={gridClass}>
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </section>
  );
}

function PollListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <p role="status" className="sr-only">
        در حال بارگذاری…
      </p>
      <div className={gridClass}>
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function PollListView() {
  const groupId = useCurrentGroupId();
  const { data, isPending, isError, error, refetch, isRefetching } =
    usePolls(groupId);

  const activePolls = data?.filter((poll) => poll.status === 'active') ?? [];
  const closedPolls = data?.filter((poll) => poll.status === 'closed') ?? [];

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between gap-3 rounded-2xl border border-secondary-20 bg-secondary-10 p-2.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-lg bg-secondary-70 text-white"
          >
            <BarChart2 className="size-5" />
          </span>
          <h1 className="text-heading-5 text-primary-80">نظرسنجی</h1>
        </div>
        {/* TODO: navigate to the create-poll page once it exists. */}
        {/* On very narrow screens only the icon is shown; the label stays for screen readers. */}
        <Button
          tone="secondary"
          radius="md"
          endIcon={<Plus className="size-4" />}
          className="shrink-0 max-[400px]:w-8.75 max-[400px]:px-0"
        >
          <span className="max-[400px]:sr-only">نظرسنجی جدید</span>
        </Button>
      </header>

      <div className="flex flex-col gap-8 rounded-3xl border border-secondary-60 p-3 sm:p-6">
        {isPending ? (
          <PollListSkeleton />
        ) : isError ? (
          <ErrorState
            error={error}
            onRetry={() => void refetch()}
            isRetrying={isRefetching}
          />
        ) : data.length === 0 ? (
          <EmptyState
            title="هنوز نظرسنجی‌ای ساخته نشده"
            description="با ساخت اولین نظرسنجی، نظر اعضای اکیپ را بپرسید."
          />
        ) : (
          <>
            <PollSection
              title="نظرسنجی‌های فعال"
              polls={activePolls}
              dotClass="bg-secondary-50"
            />
            <PollSection
              title="نظرسنجی‌های تمام شده"
              polls={closedPolls}
              dotClass="bg-neutral-50"
            />
          </>
        )}
      </div>
    </div>
  );
}

import { useId } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGroupId } from '@/features/groups/hooks/use-group-id';
import { useToggleClaim } from '@/features/checklist/hooks/use-toggle-claim';
import { ChecklistAssigneeChip } from './checklist-assignee-chip';
import type { ChecklistItem } from '@/features/checklist/types';

interface ChecklistItemRowProps {
  item: ChecklistItem;
  viewerMemberId: string;
  onDelete: (item: ChecklistItem) => void;
}

export function ChecklistItemRow({
  item,
  viewerMemberId,
  onDelete,
}: ChecklistItemRowProps) {
  const groupId = useGroupId();
  const titleId = useId();
  const toggleClaim = useToggleClaim(groupId);

  const isPersonal = item.type === 'PERSONAL';
  const isClaimed = item.assignee !== null;
  const isMine = item.assignee?.memberId === viewerMemberId;
  const canToggle = item.canClaim || item.canRelease;

  return (
    <li
      className={cn(
        'flex items-center gap-2.5 rounded-xl border px-3 py-2',
        isPersonal &&
          'border-primary-20 bg-primary-10/60 dark:bg-primary-80/30',
        !isPersonal && !isClaimed && 'border-neutral-20 bg-background',
        !isPersonal &&
          isClaimed &&
          isMine &&
          'border-secondary-60 bg-secondary-10 dark:bg-secondary-80/40',
        !isPersonal &&
          isClaimed &&
          !isMine &&
          'border-primary-20 bg-primary-10 dark:bg-primary-80/30',
      )}
    >
      {isPersonal ? (
        <span
          aria-hidden="true"
          className="grid size-5.5 shrink-0 place-items-center rounded-md border-[1.5px] border-primary-30"
        >
          <span className="size-1.5 rounded-full bg-primary-60" />
        </span>
      ) : (
        <button
          type="button"
          role="checkbox"
          aria-checked={isClaimed}
          aria-labelledby={titleId}
          aria-busy={toggleClaim.isPending}
          disabled={!canToggle || toggleClaim.isPending}
          onClick={() =>
            toggleClaim.mutate({ itemId: item.id, release: item.canRelease })
          }
          className={cn(
            'grid size-5.5 shrink-0 place-items-center rounded-md border-[1.5px] outline-hidden transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-60 disabled:cursor-default motion-reduce:transition-none',
            !isClaimed &&
              'border-neutral-40 bg-background enabled:cursor-pointer enabled:hover:border-secondary-60',
            isClaimed && isMine && 'border-secondary-60 text-secondary-70',
            isClaimed && !isMine && 'border-primary-30 text-primary-50',
            toggleClaim.isPending && 'opacity-60',
          )}
        >
          {isClaimed && (
            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
          )}
        </button>
      )}

      <span
        id={titleId}
        className="min-w-0 flex-1 text-caption font-bold break-words text-primary-80"
      >
        {item.title}
      </span>

      {item.assignee && (
        <ChecklistAssigneeChip assignee={item.assignee} isMine={isMine} />
      )}

      {item.canDelete && (
        <Button
          type="button"
          variant="outline"
          size="icon-md"
          radius="md"
          aria-label={`حذف «${item.title}»`}
          onClick={() => onDelete(item)}
          className="size-8 shrink-0 border-danger-20 bg-danger-10 text-danger-40 hover:bg-danger-20/40"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      )}
    </li>
  );
}

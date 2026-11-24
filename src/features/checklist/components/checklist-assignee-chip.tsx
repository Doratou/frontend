import { cn } from '@/lib/utils';
import { ChecklistAvatar } from './checklist-avatar';
import type { ChecklistMember } from '@/features/checklist/types';

interface ChecklistAssigneeChipProps {
  assignee: ChecklistMember;
  isMine: boolean;
}

export function ChecklistAssigneeChip({
  assignee,
  isMine,
}: ChecklistAssigneeChipProps) {
  return (
    <span
      className={cn(
        'flex max-w-32 shrink-0 items-center gap-1.5 rounded-full border py-0.5 ps-2 pe-0.5 text-caption',
        isMine
          ? 'border-secondary-60 bg-secondary-10 text-secondary-80 dark:bg-secondary-80/40 dark:text-secondary-20'
          : 'border-primary-20 bg-background text-primary-80',
      )}
    >
      <span className="truncate">{isMine ? 'شما' : assignee.name}</span>
      <ChecklistAvatar
        name={assignee.name}
        avatarUrl={assignee.avatarUrl}
        className={isMine ? 'bg-secondary-70' : 'bg-primary-60'}
      />
    </span>
  );
}

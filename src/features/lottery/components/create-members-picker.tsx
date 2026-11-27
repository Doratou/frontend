import { useId, useState } from 'react';
import { Check, ChevronDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptionAvatar } from '@/features/lottery/components/option-avatar';
import type { LotteryMember } from '@/features/lottery/types';

interface CreateMembersPickerProps {
  members: LotteryMember[];
  // State of the members request, so the section never looks silently empty.
  status: 'pending' | 'error' | 'success';
  selectedMemberIds: ReadonlySet<string>;
  // When the option limit is reached, only already selected members stay clickable.
  isFull: boolean;
  // Every member of the group is already an option.
  allSelected: boolean;
  onToggle: (member: LotteryMember) => void;
  // Selects every member (up to the option limit), or clears all of them.
  onToggleAll: () => void;
}

export function CreateMembersPicker({
  members,
  status,
  selectedMemberIds,
  isFull,
  allSelected,
  onToggle,
  onToggleAll,
}: CreateMembersPickerProps) {
  const panelId = useId();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-heading-mobile-6">افزودن سریع از اکیپ</h3>
          <p className="text-caption text-muted-foreground">
            اعضای انتخاب‌شده به‌عنوان گزینه به گردونه اضافه می‌شوند
          </p>
        </div>
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          onClick={() => setIsExpanded((value) => !value)}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-secondary-60 px-3 py-1.5 text-caption text-secondary-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          اعضای اکیپ
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 transition-transform motion-reduce:transition-none',
              isExpanded && 'rotate-180',
            )}
          />
        </button>
      </div>

      {isExpanded && status !== 'success' && (
        <p
          id={panelId}
          role={status === 'error' ? 'alert' : 'status'}
          className="text-caption text-muted-foreground"
        >
          {status === 'pending'
            ? 'در حال دریافت اعضای اکیپ…'
            : 'دریافت اعضای اکیپ انجام نشد. می‌توانید گزینه‌ی دلخواه اضافه کنید.'}
        </p>
      )}

      {isExpanded && status === 'success' && members.length === 0 && (
        <p id={panelId} className="text-caption text-muted-foreground">
          عضوی برای نمایش وجود ندارد.
        </p>
      )}

      {isExpanded && status === 'success' && members.length > 0 && (
        <ul id={panelId} className="flex flex-wrap gap-2">
          {members.length > 1 && (
            <li>
              <button
                type="button"
                disabled={isFull && !allSelected}
                title={
                  isFull && !allSelected
                    ? 'به حداکثر تعداد گزینه‌ها رسیده‌اید.'
                    : undefined
                }
                onClick={onToggleAll}
                className="flex items-center gap-2 rounded-full border border-dashed border-secondary-60 px-3 py-1.5 text-paragraph-sm text-secondary-foreground transition-colors outline-none hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Users className="size-4" aria-hidden="true" />
                {allSelected ? 'برداشتن همه' : 'انتخاب همه'}
              </button>
            </li>
          )}
          {members.map((member) => {
            const selected = selectedMemberIds.has(member.id);
            return (
              <li key={member.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={isFull && !selected}
                  onClick={() => onToggle(member)}
                  className="flex items-center gap-2 rounded-full border py-1 ps-1 pe-3 text-paragraph-sm transition-colors outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-secondary-60 aria-pressed:bg-secondary aria-pressed:text-secondary-foreground"
                >
                  <OptionAvatar member={member} size="xs" />
                  {member.name}
                  {selected && <Check className="size-4" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { formatItemCount } from '@/features/checklist/format';
import { ChecklistItemRow } from './checklist-item-row';
import type { ChecklistItem } from '@/features/checklist/types';

interface ChecklistSectionProps {
  title: string;
  dotClass: string;
  description?: string;
  emptyText: string;
  items: ChecklistItem[];
  viewerMemberId: string;
  form?: ReactNode;
  onDeleteItem: (item: ChecklistItem) => void;
}

export function ChecklistSection({
  title,
  dotClass,
  description,
  emptyText,
  items,
  viewerMemberId,
  form,
  onDeleteItem,
}: ChecklistSectionProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-2xl border border-neutral-20 p-3"
    >
      <header className="flex items-center justify-between gap-2">
        <h2
          id={titleId}
          className="flex items-center gap-2 text-heading-6 text-primary-80"
        >
          <span
            aria-hidden="true"
            className={cn('size-2 rounded-full', dotClass)}
          />
          {title}
        </h2>
        <span className="rounded-full bg-neutral-20/50 px-2 py-0.5 text-caption whitespace-nowrap text-neutral-70">
          {formatItemCount(items.length)}
        </span>
      </header>

      {description && (
        <p className="text-caption text-neutral-60">{description}</p>
      )}

      {form}

      {items.length === 0 ? (
        <p className="py-2 text-center text-caption text-neutral-60">
          {emptyText}
        </p>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              viewerMemberId={viewerMemberId}
              onDelete={onDeleteItem}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

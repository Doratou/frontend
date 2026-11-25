import { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toPersianDigits } from '@/features/groups/components/GroupHeader';
import {
  DEFAULT_ARCHIVED_FILTERS,
  type ArchivedFilterState,
  type ArchivedSortOption,
  type GroupPlan,
  type GroupRole,
} from '@/features/groups/types';
import { cn } from '@/lib/utils';

interface ArchivedToolbarProps {
  visibleCount: number;
  totalFilteredCount: number;
  totalArchivedCount: number;
  filters: ArchivedFilterState;
  onFiltersChange: (next: ArchivedFilterState) => void;
  sortBy: ArchivedSortOption;
  onSortChange: (next: ArchivedSortOption) => void;
  availableYears: number[];
}

const SORT_LABELS: Record<ArchivedSortOption, string> = {
  newest_trip: 'جدیدترین سفر',
  oldest_trip: 'قدیمی‌ترین سفر',
  name_asc: 'نام اکیپ (الف تا ی)',
  most_members: 'بیشترین تعداد عضو',
  archived_at: 'تاریخ آرشیو شدن',
};

const SORT_SHORT_LABELS: Record<ArchivedSortOption, string> = {
  newest_trip: 'جدیدترین',
  oldest_trip: 'قدیمی‌ترین',
  name_asc: 'نام اکیپ',
  most_members: 'تعداد عضو',
  archived_at: 'تاریخ آرشیو',
};

const PLAN_LABELS: Record<'ALL' | GroupPlan, string> = {
  ALL: 'همه',
  NORMAL: 'عادی',
  PREMIUM: 'پریمیوم',
};

const ROLE_LABELS: Record<'ALL' | GroupRole, string> = {
  ALL: 'همه',
  OWNER: 'سازنده',
  MEMBER: 'عضو',
};

export function ArchivedToolbar({
  visibleCount,
  totalFilteredCount,
  totalArchivedCount,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  availableYears,
}: ArchivedToolbarProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [draft, setDraft] = useState<ArchivedFilterState>(filters);

  const activeFilterCount =
    (filters.plan !== 'ALL' ? 1 : 0) +
    (filters.role !== 'ALL' ? 1 : 0) +
    (filters.year !== 'ALL' ? 1 : 0);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraft(filters);
    }
    setPopoverOpen(open);
  };

  const handleApply = () => {
    onFiltersChange(draft);
    setPopoverOpen(false);
  };

  const handleClearDraft = () => {
    setDraft(DEFAULT_ARCHIVED_FILTERS);
  };

  const handleClearAll = () => {
    onFiltersChange(DEFAULT_ARCHIVED_FILTERS);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top Row: Filter + Sort on Right, Count on Left */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Filter Popover */}
          <Popover.Root open={popoverOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger
              className={cn(
                'inline-flex h-9.5 cursor-pointer items-center gap-2 rounded-xl border px-3 text-button-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60',
                activeFilterCount > 0
                  ? 'border-primary-40 bg-primary-10 text-primary-80'
                  : 'border-neutral-20 bg-white text-primary-70 hover:bg-primary-10/60',
              )}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              <span>فیلتر</span>
              {activeFilterCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-primary-70 text-[11px] font-bold text-white">
                  {toPersianDigits(activeFilterCount)}
                </span>
              )}
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Positioner sideOffset={8} align="end" className="z-50">
                <Popover.Popup
                  dir="rtl"
                  className="w-80 rounded-2xl border border-neutral-20 bg-white p-4 text-foreground shadow-xl outline-hidden"
                >
                  <div className="flex items-center justify-between pb-3">
                    <h4 className="text-heading-6 text-primary-80">
                      فیلتر اکیپ‌های آرشیو
                    </h4>
                    <button
                      type="button"
                      onClick={handleClearDraft}
                      className="cursor-pointer text-caption font-medium text-primary-60 hover:text-primary-80"
                    >
                      پاک کردن همه
                    </button>
                  </div>

                  <div className="flex flex-col gap-3.5 border-y border-neutral-20 py-3.5">
                    {/* Plan Filter */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-caption font-medium text-neutral-70">
                        نوع اکیپ
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(['ALL', 'NORMAL', 'PREMIUM'] as const).map((plan) => (
                          <button
                            key={plan}
                            type="button"
                            onClick={() => setDraft((d) => ({ ...d, plan }))}
                            className={cn(
                              'h-8 cursor-pointer rounded-xl border px-3 text-caption font-medium transition-colors',
                              draft.plan === plan
                                ? 'border-primary-70 bg-primary-70 text-white'
                                : 'border-neutral-20 bg-white text-neutral-70 hover:bg-primary-10',
                            )}
                          >
                            {PLAN_LABELS[plan]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Role Filter */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-caption font-medium text-neutral-70">
                        نقش من
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(['ALL', 'OWNER', 'MEMBER'] as const).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setDraft((d) => ({ ...d, role }))}
                            className={cn(
                              'h-8 cursor-pointer rounded-xl border px-3 text-caption font-medium transition-colors',
                              draft.role === role
                                ? 'border-primary-70 bg-primary-70 text-white'
                                : 'border-neutral-20 bg-white text-neutral-70 hover:bg-primary-10',
                            )}
                          >
                            {ROLE_LABELS[role]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Year Filter */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-caption font-medium text-neutral-70">
                        سال سفر
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({ ...d, year: 'ALL' }))
                          }
                          className={cn(
                            'h-8 cursor-pointer rounded-xl border px-3 text-caption font-medium transition-colors',
                            draft.year === 'ALL'
                              ? 'border-primary-70 bg-primary-70 text-white'
                              : 'border-neutral-20 bg-white text-neutral-70 hover:bg-primary-10',
                          )}
                        >
                          همه
                        </button>
                        {availableYears.map((year) => (
                          <button
                            key={year}
                            type="button"
                            onClick={() => setDraft((d) => ({ ...d, year }))}
                            className={cn(
                              'h-8 cursor-pointer rounded-xl border px-3 text-caption font-medium transition-colors',
                              draft.year === year
                                ? 'border-primary-70 bg-primary-70 text-white'
                                : 'border-neutral-20 bg-white text-neutral-70 hover:bg-primary-10',
                            )}
                          >
                            {toPersianDigits(year)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Popover Footer */}
                  <div className="flex items-center gap-2 pt-3">
                    <Button
                      type="button"
                      tone="primary"
                      size="md"
                      radius="lg"
                      onClick={handleApply}
                      className="flex-1 justify-center"
                    >
                      نمایش نتیجه
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      tone="primary"
                      size="md"
                      radius="lg"
                      onClick={() => setPopoverOpen(false)}
                      className="border-neutral-30 text-neutral-70"
                    >
                      انصراف
                    </Button>
                  </div>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9.5 cursor-pointer items-center gap-2 rounded-xl border border-neutral-20 bg-white px-3 text-button-sm text-primary-70 transition-colors hover:bg-primary-10/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60">
              <ArrowUpDown className="size-4" aria-hidden="true" />
              <span>
                <span className="text-neutral-60">مرتب‌سازی: </span>
                <strong className="font-medium text-primary-80">
                  {SORT_SHORT_LABELS[sortBy]}
                </strong>
              </span>
              <ChevronDown className="size-4 text-neutral-50" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="min-w-48 p-1.5">
              <p className="px-2.5 py-1.5 text-caption text-neutral-50">
                مرتب‌سازی بر اساس
              </p>
              {(Object.keys(SORT_LABELS) as ArchivedSortOption[]).map(
                (option) => {
                  const selected = sortBy === option;
                  return (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => onSortChange(option)}
                      className={cn(
                        'justify-between',
                        selected && 'bg-primary-10 font-medium text-primary-80',
                      )}
                    >
                      <span>{SORT_LABELS[option]}</span>
                      {selected && (
                        <Check
                          className="size-4 text-primary-70"
                          aria-hidden="true"
                        />
                      )}
                    </DropdownMenuItem>
                  );
                },
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-caption text-neutral-60">
          {activeFilterCount > 0
            ? `نمایش ${toPersianDigits(totalFilteredCount)} نتیجه`
            : `نمایش ${toPersianDigits(visibleCount)} از ${toPersianDigits(totalArchivedCount)} اکیپ`}
        </p>
      </div>

      {/* Active Filter Chips Row */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {filters.plan !== 'ALL' && (
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, plan: 'ALL' })}
                className="inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full border border-primary-30 bg-primary-10/70 px-3 text-caption font-medium text-primary-80 transition-colors hover:bg-primary-20/70"
              >
                <span>نوع: {PLAN_LABELS[filters.plan]}</span>
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}

            {filters.role !== 'ALL' && (
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, role: 'ALL' })}
                className="inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full border border-primary-30 bg-primary-10/70 px-3 text-caption font-medium text-primary-80 transition-colors hover:bg-primary-20/70"
              >
                <span>نقش: {ROLE_LABELS[filters.role]}</span>
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}

            {filters.year !== 'ALL' && (
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, year: 'ALL' })}
                className="inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full border border-primary-30 bg-primary-10/70 px-3 text-caption font-medium text-primary-80 transition-colors hover:bg-primary-20/70"
              >
                <span>سال: {toPersianDigits(filters.year)}</span>
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearAll}
            className="cursor-pointer text-caption font-medium text-primary-70 hover:text-primary-80"
          >
            پاک کردن همه
          </button>
        </div>
      )}
    </div>
  );
}

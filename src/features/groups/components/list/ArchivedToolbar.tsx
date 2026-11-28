import { useRef, useState, type ReactNode } from 'react';
import { Popover } from '@base-ui/react/popover';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DEFAULT_ARCHIVED_FILTERS,
  type ArchivedFilterState,
  type ArchivedSortOption,
  type GroupPlan,
  type GroupRole,
} from '@/features/groups/types';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/format';

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

interface FilterPanelContentProps {
  draft: ArchivedFilterState;
  setDraft: React.Dispatch<React.SetStateAction<ArchivedFilterState>>;
  availableYears: number[];
  onApply: () => void;
  onCancel: () => void;
  onClearDraft: () => void;
  showCloseButton?: boolean;
}

function FilterPanelContent({
  draft,
  setDraft,
  availableYears,
  onApply,
  onCancel,
  onClearDraft,
  showCloseButton = false,
}: FilterPanelContentProps) {
  return (
    <>
      <div className="flex items-center justify-between pb-3">
        <h4 className="text-heading-6 text-primary-80">فیلتر اکیپ‌های آرشیو</h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearDraft}
            className="cursor-pointer text-caption font-medium text-primary-60 hover:text-primary-80"
          >
            پاک کردن همه
          </button>
          {showCloseButton && (
            <Button
              type="button"
              variant="outline"
              size="icon-md"
              radius="lg"
              aria-label="بستن"
              onClick={onCancel}
              className="size-8 border-neutral-30 text-neutral-70"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
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
                  'h-8.5 cursor-pointer rounded-xl border px-3.5 text-caption font-medium transition-colors',
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
                  'h-8.5 cursor-pointer rounded-xl border px-3.5 text-caption font-medium transition-colors',
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
              onClick={() => setDraft((d) => ({ ...d, year: 'ALL' }))}
              className={cn(
                'h-8.5 cursor-pointer rounded-xl border px-3.5 text-caption font-medium transition-colors',
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
                  'h-8.5 cursor-pointer rounded-xl border px-3.5 text-caption font-medium transition-colors',
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

      {/* Footer */}
      <div className="flex items-center gap-2 pt-3">
        <Button
          type="button"
          tone="primary"
          size="md"
          radius="lg"
          onClick={onApply}
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
          onClick={onCancel}
          className="border-neutral-30 text-neutral-70"
        >
          انصراف
        </Button>
      </div>
    </>
  );
}

interface SwipeableBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  children: ReactNode;
}

function SwipeableBottomSheet({
  open,
  onOpenChange,
  className,
  children,
}: SwipeableBottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setDragY(0);
    setIsDragging(false);
    startYRef.current = null;
    onOpenChange(nextOpen);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    startYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const delta = Math.max(0, event.clientY - startYRef.current);
    setDragY(delta);
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const delta = Math.max(0, event.clientY - startYRef.current);
    startYRef.current = null;
    setIsDragging(false);
    setDragY(0);
    if (delta > 64) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 180ms ease-out',
        }}
        className={cn(
          'top-auto right-0 bottom-0 left-0 w-full max-w-none translate-x-0 translate-y-0 rounded-t-3xl rounded-b-none p-5',
          className,
        )}
      >
        <div
          aria-hidden="true"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          className="-mx-5 -mt-5 mb-2 flex cursor-grab touch-none justify-center pt-3 pb-2 active:cursor-grabbing"
        >
          <span className="h-1.5 w-11 rounded-full bg-primary-20" />
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}

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
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [draft, setDraft] = useState<ArchivedFilterState>(filters);

  const activeFilterCount =
    (filters.plan !== 'ALL' ? 1 : 0) +
    (filters.role !== 'ALL' ? 1 : 0) +
    (filters.year !== 'ALL' ? 1 : 0);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraft(filters);
    }
    setFilterOpen(open);
  };

  const handleApply = () => {
    onFiltersChange(draft);
    setFilterOpen(false);
  };

  const handleClearDraft = () => {
    setDraft(DEFAULT_ARCHIVED_FILTERS);
  };

  const handleClearAll = () => {
    onFiltersChange(DEFAULT_ARCHIVED_FILTERS);
  };

  const filterTriggerClass = cn(
    'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-button-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60',
    activeFilterCount > 0
      ? 'border-primary-40 bg-primary-10 text-primary-80'
      : 'border-neutral-20 bg-white text-primary-70 hover:bg-primary-10/60',
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Top Row: Filter + Sort on Right, Count on Left */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex w-full items-center gap-2 md:w-auto">
          {/* Filter Trigger: Mobile Bottom Sheet vs Desktop Popover */}
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => handleOpenChange(true)}
                className={cn(filterTriggerClass, 'shrink-0')}
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                <span>فیلتر</span>
                {activeFilterCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-primary-70 text-[11px] font-bold text-white">
                    {toPersianDigits(activeFilterCount)}
                  </span>
                )}
              </button>

              <SwipeableBottomSheet
                open={filterOpen}
                onOpenChange={handleOpenChange}
                className="max-h-[85dvh]"
              >
                <DialogTitle className="sr-only">
                  فیلتر اکیپ‌های آرشیو
                </DialogTitle>
                <FilterPanelContent
                  draft={draft}
                  setDraft={setDraft}
                  availableYears={availableYears}
                  onApply={handleApply}
                  onCancel={() => setFilterOpen(false)}
                  onClearDraft={handleClearDraft}
                  showCloseButton
                />
              </SwipeableBottomSheet>
            </>
          ) : (
            <Popover.Root open={filterOpen} onOpenChange={handleOpenChange}>
              <Popover.Trigger className={filterTriggerClass}>
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
                    <FilterPanelContent
                      draft={draft}
                      setDraft={setDraft}
                      availableYears={availableYears}
                      onApply={handleApply}
                      onCancel={() => setFilterOpen(false)}
                      onClearDraft={handleClearDraft}
                    />
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
          )}

          {/* Sort Trigger: Mobile Bottom Sheet vs Desktop Dropdown */}
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => setSortSheetOpen(true)}
                className="inline-flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 rounded-xl border border-neutral-20 bg-white px-3 text-button-sm text-primary-70 transition-colors hover:bg-primary-10/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <ArrowUpDown className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    <span className="text-neutral-60">مرتب‌سازی: </span>
                    <strong className="font-medium text-primary-80">
                      {SORT_SHORT_LABELS[sortBy]}
                    </strong>
                  </span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-neutral-50" />
              </button>

              <SwipeableBottomSheet
                open={sortSheetOpen}
                onOpenChange={setSortSheetOpen}
                className="max-h-[80dvh]"
              >
                <div className="flex items-center justify-between pb-3">
                  <DialogTitle className="text-heading-6 text-primary-80">
                    مرتب‌سازی بر اساس
                  </DialogTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-md"
                    radius="lg"
                    aria-label="بستن"
                    onClick={() => setSortSheetOpen(false)}
                    className="size-8 border-neutral-30 text-neutral-70"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="flex flex-col gap-1">
                  {(Object.keys(SORT_LABELS) as ArchivedSortOption[]).map(
                    (option) => {
                      const selected = sortBy === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            onSortChange(option);
                            setSortSheetOpen(false);
                          }}
                          className={cn(
                            'flex h-11 w-full cursor-pointer items-center justify-between rounded-xl px-3.5 text-button-sm transition-colors',
                            selected
                              ? 'bg-primary-10 font-medium text-primary-80'
                              : 'text-neutral-70 hover:bg-neutral-10',
                          )}
                        >
                          <span>{SORT_LABELS[option]}</span>
                          {selected && (
                            <Check
                              className="size-4 text-primary-70"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </SwipeableBottomSheet>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-neutral-20 bg-white px-3 text-button-sm text-primary-70 transition-colors hover:bg-primary-10/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60">
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
                          selected &&
                            'bg-primary-10 font-medium text-primary-80',
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
          )}
        </div>

        <p className="hidden text-caption text-neutral-60 md:block">
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
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-primary-30 bg-primary-10/70 px-3 text-caption font-medium text-primary-80 transition-colors hover:bg-primary-20/70"
              >
                <span>نوع: {PLAN_LABELS[filters.plan]}</span>
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}

            {filters.role !== 'ALL' && (
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, role: 'ALL' })}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-primary-30 bg-primary-10/70 px-3 text-caption font-medium text-primary-80 transition-colors hover:bg-primary-20/70"
              >
                <span>نقش: {ROLE_LABELS[filters.role]}</span>
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}

            {filters.year !== 'ALL' && (
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, year: 'ALL' })}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-primary-30 bg-primary-10/70 px-3 text-caption font-medium text-primary-80 transition-colors hover:bg-primary-20/70"
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

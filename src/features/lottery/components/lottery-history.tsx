import type { UIEvent } from 'react';
import { Calendar, Clock, Crown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPersianClock, formatPersianLongDate } from '@/lib/persian-date';
import { LotteryFrame } from '@/features/lottery/components/lottery-frame';
import { OptionAvatar } from '@/features/lottery/components/option-avatar';
import type {
  LotteryHistoryEntry,
  LotteryWinner,
} from '@/features/lottery/types';

interface LotteryHistoryProps {
  // Every loaded completed draw, newest first.
  entries: LotteryHistoryEntry[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onShowDetails: (lotteryId: string) => void;
  onCreateAgain: (lotteryId: string) => void;
  // The lottery whose copy is being prepared right now.
  creatingAgainId: string | null;
  // Creating is not possible at the moment (for example a lottery is waiting).
  createAgainDisabled: boolean;
  createAgainDisabledReason?: string;
}

const HEADERS = ['گزینه‌ی انتخاب‌شده', 'عنوان قرعه‌کشی', 'تاریخ', 'ساعت'];

// The next page is requested this close to the end of the scroll area.
const LOAD_MORE_THRESHOLD_PX = 160;

// Rounded "row" look: every cell draws its own borders, the first and last
// cells round the corners.
const CELL =
  'border-y bg-card px-3 py-2.5 text-paragraph-sm first:rounded-s-xl first:border-s last:rounded-e-xl last:border-e';

const META_CLASS = 'flex items-center gap-1.5 text-muted-foreground';

function Winner({ winner }: { winner: LotteryWinner }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {winner.member && <OptionAvatar member={winner.member} size="xs" />}
      <span className="truncate text-heading-mobile-6">{winner.label}</span>
    </span>
  );
}

interface RowActionsProps {
  entry: LotteryHistoryEntry;
  onShowDetails: (lotteryId: string) => void;
  onCreateAgain: (lotteryId: string) => void;
  creatingAgainId: string | null;
  createAgainDisabled: boolean;
  createAgainDisabledReason?: string;
  // Buttons share the row equally (mobile card) instead of hugging their text.
  stretch?: boolean;
}

function RowActions({
  entry,
  onShowDetails,
  onCreateAgain,
  creatingAgainId,
  createAgainDisabled,
  createAgainDisabledReason,
  stretch = false,
}: RowActionsProps) {
  const isPreparing = creatingAgainId === entry.id;
  const isDisabled = createAgainDisabled || creatingAgainId !== null;
  const buttonClass = stretch ? 'w-full' : undefined;

  return (
    <div
      className={stretch ? 'grid grid-cols-2 gap-2' : 'flex justify-end gap-2'}
    >
      <Button
        variant="outline"
        tone="secondary"
        radius="md"
        className={buttonClass}
        onClick={() => onShowDetails(entry.id)}
      >
        جزئیات
      </Button>
      <Button
        variant="outline"
        radius="md"
        className={buttonClass}
        disabled={isDisabled}
        title={createAgainDisabled ? createAgainDisabledReason : undefined}
        onClick={() => onCreateAgain(entry.id)}
        endIcon={<Plus className="size-4" />}
      >
        {isPreparing ? 'در حال آماده‌سازی…' : 'ساخت دوباره'}
      </Button>
    </div>
  );
}

export function LotteryHistory({
  entries,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onShowDetails,
  onCreateAgain,
  creatingAgainId,
  createAgainDisabled,
  createAgainDisabledReason,
}: LotteryHistoryProps) {
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const area = event.currentTarget;
    const remaining = area.scrollHeight - area.scrollTop - area.clientHeight;
    if (hasMore && !isLoadingMore && remaining < LOAD_MORE_THRESHOLD_PX) {
      onLoadMore();
    }
  };

  const actions = {
    onShowDetails,
    onCreateAgain,
    creatingAgainId,
    createAgainDisabled,
    createAgainDisabledReason,
  };

  return (
    // The frame is a size container, so the table/cards switch follows the width
    // it really gets (it changes with the sidebar), not the viewport.
    <LotteryFrame className="@container gap-4">
      <h2 className="flex items-center gap-2 text-heading-6 text-primary-80">
        <span
          aria-hidden="true"
          className="size-2 rounded-full bg-accent-50"
        />
        تاریخچه‌ی قرعه‌کشی
      </h2>
      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-center text-paragraph-sm text-muted-foreground">
          هنوز قرعه‌ای انجام نشده است.
        </p>
      ) : (
        // A short history takes only the height it needs; a long one scrolls
        // inside the card and loads older draws when the end comes near.
        <div
          role="region"
          aria-label="فهرست قرعه‌کشی‌های انجام‌شده"
          tabIndex={0}
          onScroll={handleScroll}
          className="max-h-[28rem] overflow-y-auto pe-1 outline-none [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:max-h-[32rem]"
        >
          {/* Four columns and two buttons need roughly 56rem; narrower cards
              use the card list. */}
          <table className="hidden w-full border-separate border-spacing-y-2 @4xl:table">
            <thead>
              <tr>
                {HEADERS.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="sticky top-0 z-10 bg-card px-3 pb-1 text-start text-caption font-normal whitespace-nowrap text-muted-foreground"
                  >
                    {header}
                  </th>
                ))}
                <th
                  scope="col"
                  className="sticky top-0 z-10 w-px bg-card px-3 pb-1"
                >
                  <span className="sr-only">عملیات</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className={CELL}>
                    <Winner winner={entry.winner} />
                  </td>
                  <td className={CELL}>{entry.title}</td>
                  <td className={`${CELL} whitespace-nowrap`}>
                    <span className={META_CLASS}>
                      <Calendar
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {formatPersianLongDate(entry.drawnAt)}
                    </span>
                  </td>
                  <td className={`${CELL} whitespace-nowrap`}>
                    <span className={META_CLASS}>
                      <Clock className="size-4 shrink-0" aria-hidden="true" />
                      {formatPersianClock(entry.drawnAt)}
                    </span>
                  </td>
                  <td className={`${CELL} w-px whitespace-nowrap`}>
                    <RowActions entry={entry} {...actions} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="grid gap-2 @xl:grid-cols-2 @4xl:hidden">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-3 rounded-xl border p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-heading-mobile-6">{entry.title}</span>
                  <span className="flex shrink-0 flex-col gap-1 text-caption text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {formatPersianLongDate(entry.drawnAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-4 shrink-0" aria-hidden="true" />
                      {formatPersianClock(entry.drawnAt)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2">
                  <Winner winner={entry.winner} />
                  <span className="flex shrink-0 items-center gap-1 text-caption text-accent-70 dark:text-accent-30">
                    <Crown className="size-4" aria-hidden="true" />
                    گزینه‌ی انتخاب‌شده
                  </span>
                </div>
                <RowActions entry={entry} stretch {...actions} />
              </li>
            ))}
          </ul>

          {isLoadingMore && (
            <p
              role="status"
              className="py-3 text-center text-caption text-muted-foreground"
            >
              در حال دریافت قرعه‌کشی‌های قبلی…
            </p>
          )}
          {/* Fallback for keyboard users and for areas that do not overflow. */}
          {hasMore && !isLoadingMore && (
            <div className="flex justify-center py-2">
              <Button variant="ghost" size="md" onClick={onLoadMore}>
                نمایش قرعه‌کشی‌های قبلی
              </Button>
            </div>
          )}
        </div>
      )}
    </LotteryFrame>
  );
}

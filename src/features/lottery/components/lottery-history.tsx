import type { UIEvent } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  formatLotteryDate,
  formatLotteryTime,
  toPersianNumber,
} from '@/features/lottery/format';
import { ModeBadge } from '@/features/lottery/components/lottery-badges';
import { LotterySectionCard } from '@/features/lottery/components/lottery-section-card';
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
}

const HEADERS = [
  'گزینه‌ی انتخاب‌شده',
  'عنوان قرعه‌کشی',
  'گزینه‌ها',
  'نوع قرعه‌کشی',
  'تاریخ',
  'ساعت',
];

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

export function LotteryHistory({
  entries,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: LotteryHistoryProps) {
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const area = event.currentTarget;
    const remaining = area.scrollHeight - area.scrollTop - area.clientHeight;
    if (hasMore && !isLoadingMore && remaining < LOAD_MORE_THRESHOLD_PX) {
      onLoadMore();
    }
  };

  return (
    // The card is a size container, so the table/cards switch follows the width
    // the card really gets (it changes with the sidebar), not the viewport.
    <LotterySectionCard
      title="تاریخچه‌ی قرعه‌کشی"
      accent="amber"
      className="@container"
    >
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
          {/* Six columns need roughly 56rem; narrower cards use the card list. */}
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
                    {toPersianNumber(entry.optionCount)} گزینه
                  </td>
                  <td className={CELL}>
                    <ModeBadge mode={entry.mode} />
                  </td>
                  <td className={`${CELL} whitespace-nowrap`}>
                    <span className={META_CLASS}>
                      <Calendar
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {formatLotteryDate(entry.drawnAt)}
                    </span>
                  </td>
                  <td className={`${CELL} whitespace-nowrap`}>
                    <span className={META_CLASS}>
                      <Clock className="size-4 shrink-0" aria-hidden="true" />
                      {formatLotteryTime(entry.drawnAt)}
                    </span>
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
                <div className="flex items-start justify-between gap-2">
                  <span className="text-heading-mobile-6">{entry.title}</span>
                  <ModeBadge mode={entry.mode} />
                </div>
                <Winner winner={entry.winner} />
                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t pt-2 text-caption text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4 shrink-0" aria-hidden="true" />
                    {formatLotteryDate(entry.drawnAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4 shrink-0" aria-hidden="true" />
                    {formatLotteryTime(entry.drawnAt)}
                  </span>
                  <span>{toPersianNumber(entry.optionCount)} گزینه</span>
                </div>
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
    </LotterySectionCard>
  );
}

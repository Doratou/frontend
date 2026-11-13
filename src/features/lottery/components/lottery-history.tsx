import { Calendar, Clock } from 'lucide-react';
import {
  formatLotteryDate,
  formatLotteryTime,
  toPersianNumber,
} from '@/features/lottery/format';
import { findOption } from '@/features/lottery/utils';
import { ModeBadge } from '@/features/lottery/components/lottery-badges';
import { LotterySectionCard } from '@/features/lottery/components/lottery-section-card';
import { OptionAvatar } from '@/features/lottery/components/option-avatar';
import type { Lottery, LotteryOption } from '@/features/lottery/types';

interface LotteryHistoryProps {
  // Drawn lotteries only, newest first.
  lotteries: Lottery[];
}

const HEADERS = [
  'گزینه‌ی انتخاب‌شده',
  'عنوان قرعه‌کشی',
  'گزینه‌ها',
  'نوع قرعه‌کشی',
  'تاریخ',
  'ساعت',
];

// Rounded "row" look: every cell draws its own borders, the first and last
// cells round the corners.
const CELL =
  'border-y bg-card px-3 py-2.5 text-paragraph-sm first:rounded-s-xl first:border-s last:rounded-e-xl last:border-e';

const META_CLASS = 'flex items-center gap-1.5 text-muted-foreground';

function Winner({ option }: { option: LotteryOption | null }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {option?.member && <OptionAvatar member={option.member} size="xs" />}
      <span className="truncate text-heading-mobile-6">
        {option?.label ?? '—'}
      </span>
    </span>
  );
}

export function LotteryHistory({ lotteries }: LotteryHistoryProps) {
  return (
    // The card is a size container, so the table/cards switch follows the width
    // the card really gets (it changes with the sidebar), not the viewport.
    <LotterySectionCard
      title="تاریخچه‌ی قرعه‌کشی"
      accent="amber"
      className="@container"
    >
      {lotteries.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-center text-paragraph-sm text-muted-foreground">
          هنوز قرعه‌ای انجام نشده است.
        </p>
      ) : (
        <>
          {/* Six columns need roughly 56rem; narrower cards use the card list. */}
          <table className="hidden w-full border-separate border-spacing-y-2 @4xl:table">
            <thead>
              <tr>
                {HEADERS.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-3 text-start text-caption font-normal whitespace-nowrap text-muted-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lotteries.map((lottery) => {
                const drawnAt = lottery.result?.drawnAt ?? lottery.createdAt;
                return (
                  <tr key={lottery.id}>
                    <td className={CELL}>
                      <Winner
                        option={findOption(
                          lottery,
                          lottery.result?.optionId ?? null,
                        )}
                      />
                    </td>
                    <td className={CELL}>{lottery.title}</td>
                    <td className={`${CELL} whitespace-nowrap`}>
                      {toPersianNumber(lottery.options.length)} گزینه
                    </td>
                    <td className={CELL}>
                      <ModeBadge mode={lottery.mode} />
                    </td>
                    <td className={`${CELL} whitespace-nowrap`}>
                      <span className={META_CLASS}>
                        <Calendar
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {formatLotteryDate(drawnAt)}
                      </span>
                    </td>
                    <td className={`${CELL} whitespace-nowrap`}>
                      <span className={META_CLASS}>
                        <Clock className="size-4 shrink-0" aria-hidden="true" />
                        {formatLotteryTime(drawnAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <ul className="grid gap-2 @xl:grid-cols-2 @4xl:hidden">
            {lotteries.map((lottery) => {
              const drawnAt = lottery.result?.drawnAt ?? lottery.createdAt;
              return (
                <li
                  key={lottery.id}
                  className="flex flex-col gap-3 rounded-xl border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-heading-mobile-6">
                      {lottery.title}
                    </span>
                    <ModeBadge mode={lottery.mode} />
                  </div>
                  <Winner
                    option={findOption(
                      lottery,
                      lottery.result?.optionId ?? null,
                    )}
                  />
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t pt-2 text-caption text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {formatLotteryDate(drawnAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-4 shrink-0" aria-hidden="true" />
                      {formatLotteryTime(drawnAt)}
                    </span>
                    <span>{toPersianNumber(lottery.options.length)} گزینه</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </LotterySectionCard>
  );
}

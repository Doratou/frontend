# قرعه‌کشی (`lottery`)

بخش قرعه‌کشی و گردونهٔ شانس گروه (مسیر `/group/:groupId/lottery` در `src/app/pages/group/lottery.tsx`) با پشتیبانی از قرعه‌کشی **شانس برابر (`equal`)** و **وزن‌دار (`weighted`)**، پیش‌نویس مشترک، اجرای چرخش گردونه و تاریخچهٔ قرعه‌کشی‌ها.

## ساختار فایل‌ها

- `config.ts` — محدودیت گزینه‌ها (`LOTTERY_MIN_OPTIONS = 2` تا `LOTTERY_MAX_OPTIONS = 24`)، مجموع درصد (`100`)، اندازه صفحه تاریخچه (`50`) و تنظیمات رنگ گردونه (`WHEEL_THEME`, `pickWheelColors`).
- `schemas.ts` و `types.ts` — اعتبارسنجی فرم ساخت قرعه‌کشی (`createLotterySchema`) و مدل‌های `Lottery`, `LotteryOption`, `LotteryMember`, `LotteryHistoryEntry`, `LotteryMode`.
- `draft.ts` — مدل `LotteryDraft` و مقدار اولیه (`emptyLotteryDraft`) که برای ساخت قرعه‌کشی از نتایج نظرسنجی هم استفاده می‌شود.
- `format.ts` و `utils.ts` — فرمت درصد (`formatChance`)، محاسبه سهم و رنگ‌ها و نگاشت گزینه‌های کاربر با `formatNumber` مشترک از `@/utils/format`.
- `api/`
  - `paths.ts` — مسیرهای `drawsPath`, `drawPath`, `runDrawPath` (`/groups/:groupId/draws...`).
  - `contracts.ts` و `mappers.ts` — schemaهای DTO، `parseData` مبتنی بر `unwrapEnvelope` و نگاشت به مدل‌های کلاینت.
  - `lottery-error.ts` — `getLotteryErrorCode` (با `extractApiErrorCode` مشترک) و `getLotteryErrorMessage`.
  - `query-keys.ts` — `lotteryKeys` (`all`, `group`, `active`, `detail`, `history`).
  - `get-lotteries.ts` (`getActiveLottery`, `getLotteryHistoryPage`), `get-lottery.ts`, `create-lottery.ts`, `draw-lottery.ts`.
- `hooks/` — `use-active-lottery.ts`, `use-create-lottery.ts`, `use-draw-lottery.ts`, `use-lottery-detail.ts`, `use-lottery-draft-builder.ts`, `use-lottery-history.ts`, `use-lottery-members.ts`.
- `components/` — نمای اصلی (`lottery-view.tsx`)، صحنه و گردونه (`lottery-stage.tsx`, `lottery-wheel-card.tsx`, `lottery-wheel.tsx`, `lottery-frame.tsx`)، دیالوگ ساخت/جزئیات/نتیجه، تاریخچه و `option-avatar.tsx` (با `getMemberTone` از `@/utils/member-tone`).

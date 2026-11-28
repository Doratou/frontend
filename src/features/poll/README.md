# نظرسنجی (`poll`)

بخش نظرسنجی‌های گروه (مسیر `/group/:groupId/poll` در `src/app/pages/poll.tsx`) شامل ساخت نظرسنجی تک‌انتخابی یا چندانتخابی، رأی‌دادن یا پس‌گرفتن رأی، بستن/حذف نظرسنجی، مشاهدهٔ رأی‌دهندگان و تبدیل مستقیم نتایج به پیش‌نویس قرعه‌کشی.

## ساختار فایل‌ها

- `config.ts` — محدودیت گزینه‌ها (`MIN_POLL_OPTIONS = 2`، `MAX_POLL_OPTIONS = 10`) و طول متن‌ها (`MAX_QUESTION_LENGTH = 500`، `MAX_OPTION_LENGTH = 255`).
- `schemas.ts` و `types.ts` — اعتبارسنجی فرم ساخت نظرسنجی و مدل‌های `Poll`, `PollOption`, `PollVoter`, `PollStatus`.
- `format.ts` و `utils.ts` — `formatPollPeriod`, `formatVoteTime`, محاسبهٔ درصد (`getOptionPercent`) و به‌روزرسانی خوش‌بینانه (`withVote`, `toggleSelection`, `isPollVotable`).
- `to-lottery.ts` — تبدیل نظرسنجی و آرای گزینه‌ها به `LotteryDraft` برای بازکردن مستقیم در صفحهٔ قرعه‌کشی.
- `api/`
  - `poll-http.ts` — مسیرهای `groupPollsPath`, `pollPath` (`/groups/:groupId/polls...`), `unwrap` مشترک از `@/lib/api/envelope` و `pollRequest`.
  - `poll-error.ts` — `PollError` و `toPollError` با `extractApiErrorCode`.
  - `contracts.ts` — schemaها، نگاشت DTO و `groupVotersByOption`.
  - `query-keys.ts` — `pollKeys` (`all`, `group`, `list`, `voters`).
  - `get-polls.ts` (`fetchAllPages`), `get-poll-voters.ts`, `create-poll.ts`, `vote-poll.ts` (`PUT`/`DELETE .../vote`), `close-poll.ts`, `delete-poll.ts`.
- `hooks/` — `use-create-poll.ts`, `use-vote-poll.ts`, `use-manage-poll.ts`, `use-is-poll-owner.ts`, `use-my-member-id.ts`.
- `components/` — `poll-list-view.tsx`, `poll-card.tsx`, `poll-details-dialog.tsx`, `poll-details-view.tsx`, `poll-voters-view.tsx` (با `useAttachmentUrl` مشترک), `poll-option-list.tsx`, `poll-option-bar.tsx`, `poll-visibility-badge.tsx`, `poll-dialog-header.tsx`, `create-poll-dialog.tsx`, `create-poll-form.tsx`.

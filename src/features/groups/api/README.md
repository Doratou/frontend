# API اکیپ‌ها

محل درخواست‌ها، DTOها، query keyها و گزینه‌های Query مخصوص اکیپ:

- `contracts.ts`: schemaهای Zod برای پاسخ‌های گروه، اعضا، لینک‌های دعوت، دوستان و پیوست‌ها و نگاشت DTO به مدل‌های داخلی `../types.ts`.
- `group-error.ts`: کلاس `GroupError` و نگاشت کدهای خطای بک‌اند (`GROUP_*`، `INVITE_*`، `DIRECT_INVITE_*`) به پیام فارسی امن (با استفاده از `extractApiErrorCode`).
- `query-keys.ts`: کلیدهای مشترک کش (`groupKeys.all`، `lists`، `detail`، `members`، `settings`، `inviteLinks`، `coverAttachment`، `coverBlob` و `friends`). کلید `detail(groupId)` پیشوند `members`، `settings` و `inviteLinks` است.
- `get-groups.ts`: دریافت فهرست اکیپ‌ها با فیلتر و مرتب‌سازی (`GET /groups`) و هوک/گزینه‌های Query مرتبط.
- `create-group.ts`: ساخت و کلون اکیپ (`POST /groups` و `POST /groups/:id/clone`)، آپلود کاور از طریق `uploadAttachment` مشترک و ارسال دعوت‌نامهٔ مستقیم.
- `get-invitations.ts`: دریافت دعوت‌نامه‌های مستقیم در انتظار (`GET /invites/direct/me`).
- `group-settings-api.ts`: درخواست‌های تنظیمات اکیپ (`GET/PATCH/DELETE /groups/:id`، آپلود و ثبت کاور با `uploadAttachment` مشترک، دریافت آخرین کاور، دانلود blob، دریافت لیست دوستان `/friendships`، حذف عضو، خروج از گروه، انتقال مالکیت، آرشیو، مدیریت لینک دعوت و دعوت مستقیم دوستان).
- `get-group-members.ts`: دریافت فهرست اعضای فعال اکیپ (`GET /groups/:id/members`)، `queryOptions` و هوک `useGroupMembers`.

تمام عملیات از `apiClient` مشترک در `@/lib/api/client`، پوشش مشترک `unwrapEnvelope` در `@/lib/api/envelope` و توابع مشترک پیوست در `@/lib/api/attachments` استفاده می‌کنند و `signal?: AbortSignal` را به Axios منتقل می‌کنند. منطق Toast، فرم و navigation خارج از این پوشه و در `../hooks/use-group-settings.ts` و کامپوننت‌ها نگهداری می‌شود؛ مطابق [قرارداد مشترک API قابلیت‌ها](../../../lib/api/README.md).

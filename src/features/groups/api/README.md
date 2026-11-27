# API اکیپ‌ها

محل درخواست‌ها، DTOها، query keyها و گزینه‌های Query مخصوص اکیپ:

- `contracts.ts`: schemaهای Zod برای پاسخ‌های گروه، اعضا، لینک‌های دعوت، دوستان و پیوست‌ها و نگاشت DTO به مدل‌های داخلی `../types.ts`.
- `group-error.ts`: کلاس `GroupError` و نگاشت کدهای خطای بک‌اند (`GROUP_*`، `INVITE_*`، `DIRECT_INVITE_*`) به پیام فارسی امن.
- `query-keys.ts`: کلیدهای مشترک کش (`groupKeys.all`، `lists`، `detail`، `members`، `settings`، `inviteLinks` و `friends`). کلید `detail(groupId)` پیشوند `members`، `settings` و `inviteLinks` است.
- `group-settings-api.ts`: درخواست‌های واقعی تنظیمات گروه (`GET/PATCH/DELETE /groups/:id`، آپلود و ثبت کاور، حذف عضو، خروج از گروه، انتقال مالکیت، آرشیو، مدیریت لینک دعوت و دعوت مستقیم دوستان).
- `get-group-members.ts`: دریافت فهرست اعضای فعال اکیپ (`GET /groups/:id/members`)، `queryOptions` و هوک `useGroupMembers`.

تمام عملیات از `apiClient` مشترک در `@/lib/api/client` استفاده می‌کنند و `signal?: AbortSignal` را به Axios منتقل می‌کنند. منطق Toast، فرم و navigation خارج از این پوشه و در `../hooks/use-group-settings.ts` و کامپوننت‌ها نگهداری می‌شود؛ مطابق [قرارداد مشترک API قابلیت‌ها](../../../lib/api/README.md).

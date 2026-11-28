# کاربران (`users`)

دریافت و کش اطلاعات عمومی کاربران (شناسه، نام نمایشی و آدرس آمادهٔ آواتار) برای استفاده در نمایش پروفایل/گزینه‌های سایر اعضا.

## ساختار فایل‌ها

- `api/query-keys.ts` — کلیدهای کش `userKeys.all` (`['users']`) و `userKeys.profile(userId)` (`['users', userId, 'profile']`).
- `api/get-user-profile.ts` — تابع `getUserProfile` (`GET /users/:userId/profile` با `unwrapEnvelope` مشترک از `@/lib/api/envelope`)، `userProfileQueryOptions` (`staleTime: 5m`, `retry: false`) و نوع `UserProfile`.
- `hooks/use-user-profiles.ts` — هوک `useUserProfiles(userIds)` بر پایهٔ `useQueries` که برای هر شناسه یک درخواست کش‌شده ارسال کرده و پروفایل‌های موجود را برمی‌گرداند.

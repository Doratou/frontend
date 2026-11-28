# Profile Feature Architecture & Agent Reference

Quick-reference map for the User Profile, Home Header, and AppLayout integration (`feat/profile`). Read this before touching any file in `src/features/profile/`, `src/features/home-header/`, `src/app/pages/profile.tsx`, or `src/app/layouts/AppLayout.tsx` so you do not need to re-read the entire module tree.

---

## 1. File Map

### Route & App Shell Layer

- `src/app/pages/profile.tsx`
  - Route component mounted at `/home/profile` inside `<DashboardLayout />` (`RoleGuard` guarantees an authenticated `authUser`).
  - Bridges all cross-feature dependencies that `src/features/profile/*` is forbidden from importing by ESLint (`useAuthStore`, `useLogout`, `authApi`, `AuthError`, `authErrorMessage`, `useAttachmentUrl`, `getAttachmentDownloadUrl`, `uploadAttachment`).
  - Fetches profile via `useMyProfileQuery({ enabled: Boolean(authUser), onData: syncSessionUser })` and syncs `authStore` directly inside `onData` (no `useEffect` loop, guarded by shallow field equality).
  - Owns mutation handlers (`handleAvatarChange`, `handleRefreshFriendCode`, `handleSaveDisplayName`, `handleSendContactOtp`, `handleVerifyAndSaveContact`, `handleChangePassword`, `handleToggleTelegram`, `handleDeleteAccount`).
  - Renders a non-blocking `<ErrorState>` retry banner when `GET /users/me` fails with no cached remote profile data, while still showing session fallback fields.
- `src/app/layouts/AppLayout.tsx` & `src/app/layouts/AppHomeHeader.tsx`
  - Full-viewport fixed app shell (`fixed inset-0 h-dvh w-full overflow-hidden overscroll-none bg-[#f3f0ff]`).
  - Keeps `<Sidebar page="homepage" />` and `<AppHomeHeader />` fixed in place while only the outlet container below `AppHomeHeader` scrolls vertically (`min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain` with hidden scrollbars).
  - `AppHomeHeader.tsx` connects `useAttachmentUrl`, `useLogout`, `useNotificationsInfiniteQuery`, `useUnreadNotificationsCount`, and `useNotificationsRealtime` into `<HomeHeader />`.
- `src/features/auth/hooks/use-logout.ts`
  - Shared logout hook (`authApi.logout`, `queryClient.clear()`, `clearSession()`, `navigate('/login', { replace: true })`) used by both `AppLayout.tsx` and `profile.tsx`.
- `src/features/home-header/components/HomeHeader.tsx`, `NotificationsMenu.tsx`, `ProfileMenu.tsx`
  - Logical RTL utilities throughout (`text-start`, `start-*`, `end-*`, `ps-*`, `pe-*`, `rtl:-scale-x-100`).
  - `ProfileMenu` places avatar and `<bdi>{user.displayName}</bdi>` side by side in the top row.
- `src/features/sidebar/components/Sidebar.tsx`
  - Mobile drawer uses `md:hidden` (matching `md:block` desktop rail), `mt-28` on homepage mobile nav so items sit cleanly below the cloud artwork, `overflow-y-auto` with hidden scrollbar, and `w-1 rounded-full` active indicator.

### Profile Feature Components (`src/features/profile/components/`)

- `ProfilePageView.tsx`
  - Top-level presentational container and responsive layout (`w-full`, no `max-w-*` cap).
  - Grid layout on desktop (`lg:grid-cols-[minmax(0,1fr)_20.5rem] xl:grid-cols-[minmax(0,1fr)_22rem]`):
    - Row 1–2 col 1: `ProfileCompletionCard`
    - Row 1 col 2: `ProfileWalletCard`
    - Row 2 col 2: `ProfileTelegramCard` (`hidden md:block` — embedded inside `ProfileSettingsCard` on mobile `< md`)
    - Row 3 col 1: `ProfilePersonalInfoCard`
    - Row 3 col 2: `ProfileSettingsCard`
    - Row 4 span 2: `ProfileAccountActionsCard`
  - Lazily loads `ProfileContactDialog` and `ProfilePasswordDialog` via `React.lazy` + `Suspense`, gated by incrementing session counters (`contactDialogSession`, `passwordDialogSession`) so each modal mounts only after first open, preserves Base UI exit animations, and resets cleanly on every reopen.
  - Owns `isPersonalMobileOpen` and `isEditingName` so clicking "ثبت" on the display-name step inside `ProfileCompletionCard` opens the mobile accordion, enables the name input, scrolls it into view, and focuses it.
- `ProfileHeroCard.tsx`
  - Starry wave banner (`hero-banner.webp`, `object-fill`, `rounded-[24px]`), circular avatar with upload trigger (`5MB` + `image/*` check + optimistic `blob:` preview + `fallbackAvatarUrl` chain), display name `<bdi>`, and glassmorphic role badge (`کاربر` / `مدیر`).
  - Floating cards row directly below the banner:
    - Start side: friendship milestone (`آغاز این دوستی`, memoized Persian month/year from `joinedAtMs`).
    - End side: friend code card (`کد دوستی شما`, `lg:w-[20.5rem] xl:w-[22rem]` matching `ProfileWalletCard` column width directly underneath) with copy + animated regenerate button guarded by an above-button Base UI `<Popover>` confirmation bubble.
- `ProfileWalletCard.tsx`
  - Token balance card (`rounded-[20px]`) with link/button to `/home/wallet`.
- `ProfileCompletionCard.tsx`
  - 5-step completion progress banner (`نام و نام خانوادگی`, `تصویر پروفایل`, `تأیید شماره تلفن`, `ثبت ایمیل`, `اتصال تلگرام`) + 3-token reward pill.
  - On mobile (`< md`), attaches a bottom toggle strip (`مشاهده مراحل تکمیل` / `بستن مراحل` with rotating `ChevronDown`) that collapses/expands the checklist steps (collapsed by default on mobile; always expanded on `md:`+).
- `ProfilePersonalInfoCard.tsx`
  - Mobile-collapsible card (`< md` collapsed by default, entire header clickable via `after:absolute after:inset-0 md:after:hidden`, always expanded on `md:`+).
  - **Display Name**: uses project `<TextField>` (`disabled={!isEditingName || isSavingName}` by default), external `size-8` circular edit/save button (`Pencil` / `Check` / `Spinner`), guarded against double submission on `Enter`/`Click` + `onBlur` via `isCommittingRef` + `skipBlurRef`.
  - **Email & Phone (`ContactTextField`)**: read-only `<TextField>` (`status="success"` when verified); shows external `size-8` icon-only `Pencil` button when populated, or inline `ثبت ایمیل` / `ثبت شماره` pill when empty.
  - **Password row**: opens `ProfilePasswordDialog` via `onOpenPasswordDialog`.
- `ProfileContactDialog.tsx`
  - Two-step OTP flow (`input` -> `verify`) inside Base UI `<Dialog>` with `X` close button, shared `useCountdown` hook, unchanged-value guard, and `axios.isCancel` handling.
- `ProfilePasswordDialog.tsx`
  - Authenticated password change modal (`رمز عبور فعلی`, `رمز عبور جدید`, `تأیید رمز عبور`) using `<PasswordField>` + `changePasswordFormSchema` + `X` close button. Delegates the API call via `onChangePassword` callback (no direct `features/auth` imports).
- `ProfileSidebarCards.tsx`
  - `ProfileTelegramCard` (supports `embedded?: boolean` to render borderless inside `ProfileSettingsCard` on mobile).
  - `ProfileSettingsCard` (mobile-collapsible card matching `ProfilePersonalInfoCard`, full clickable mobile header, hosts `appNotifications` + `telegramNotifications` toggles and `mobileExtraContent` containing embedded `ProfileTelegramCard` on `< md`). Dark mode toggle was intentionally removed.
  - `ProfileAccountActionsCard` (logout `<LoadingButton>` + permanent account delete `<ConfirmDialog>`).

### Data, Schemas, API & Utilities (`src/features/profile/`)

- `types.ts` — `UserProfile`, `ProfileData` (`joinedAtMs: number | null`, `friendCode: string | null`), `ProfilePreferences` (`appNotifications`, `telegramNotifications`), `ContactDialogField`, `ProfileRole`, `ProfileStatus`.
- `schemas.ts` — `PROFILE_AVATAR_MAX_BYTES` (`5MB`), `PROFILE_ROLE_LABELS`, `normalizeIranPhone`, `formatIranPhone`, `displayNameSchema`, `emailFormSchema`, `phoneFormSchema`, `changePasswordFormSchema`, `ChangePasswordFormValues`.
- `api/query-keys.ts` — `profileKeys.all` and `profileKeys.me()`.
- `api/contracts.ts` — `profileUserDtoSchema`, `deleteAccountDtoSchema`, `mapUserDtoToProfile` (parses `created_at` to `joinedAtMs`; uses `successEnvelopeSchema` from `@/lib/api/envelope`).
- `api/profile-error.ts` — `ProfileErrorOperation` and `getProfileErrorMessage` (returns `undefined` on `axios.isCancel`).
- `api/profile-api.ts` — HTTP functions + `useMyProfileQuery`, `useProfileUpdateMutation`, `useDeleteAccountMutation`.
- `hooks/use-profile-preferences.ts` — Local state for notification toggle preferences.
- `utils/profile-action.ts` — `runProfileAction` helper for consistent mutation success/error toast handling (replaces non-hook `use-profile-actions.ts`).

---

## 2. Backend Endpoints & Cache Rules

| Action                 | Method & Path                                    | Request Payload                    | Cache / State Effect                                                             |
| ---------------------- | ------------------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------- |
| Fetch profile          | `GET /users/me`                                  | —                                  | Cached at `profileKeys.me()`; syncs `authStore`                                  |
| Update display name    | `PATCH /users/me`                                | `{ name }`                         | Updates `profileKeys.me()` + `authStore`                                         |
| Upload avatar file     | `POST /attachments/upload`                       | `PROFILE_IMAGE`, `is_public: true` | Seeds `attachmentUrlKey(id)` (`@/hooks/use-attachment-url`) when `accessUrl` set |
| Save avatar ID         | `PATCH /auth/me/avatar`                          | `{ avatar_attachment_id }`         | Updates `profileKeys.me()` + `authStore`                                         |
| Send contact OTP       | `POST /auth/otp/send`                            | `{ identifier, purpose: 'login' }` | Returns `{ codeLength, expiresAt }`                                              |
| Verify contact OTP     | `POST /auth/otp/verify`                          | `{ identifier, code }`             | Must succeed before calling email/phone PATCH                                    |
| Update email / phone   | `PATCH /users/me/email`, `PATCH /users/me/phone` | `{ email }` / `{ phone }`          | Updates `profileKeys.me()` + `authStore`                                         |
| Change password        | `POST /auth/password/change`                     | `{ old_password, new_password }`   | Both fields required (`new_password` >= 6 chars)                                 |
| Regenerate friend code | `POST /users/me/friend-code/regenerate`          | —                                  | Updates `profileKeys.me()` + `authStore`                                         |
| Delete account         | `DELETE /users/me`                               | —                                  | Removes `profileKeys.all`, clears query & auth session                           |

---

## 3. Critical Invariants & Gotchas

1. **React Query v5 `mutationFn` 2nd Argument Trap (`profile-api.ts`)**:
   - TanStack Query v5 invokes `mutationFn(variables, context)` where `context` is `MutationFunctionContext` (NOT an `AbortSignal`).
   - Passing a 2-arg function like `updateProfileName(input, signal?)` directly to `useMutation({ mutationFn })` forwards `context` as Axios `{ signal }`, causing a runtime `TypeError` that falls back to `"خطای غیرمنتظره‌ای رخ داد"`.
   - Always keep `useProfileUpdateMutation` wrapping `mutationFn: (input: TInput) => mutationFn(input)`.
2. **Preventing Double-Save / Double-Toast on Inline Name Edit (`ProfilePersonalInfoCard.tsx`)**:
   - Flipping `disabled={!isEditingName || isSavingName}` to `true` when saving begins blurs the `<input>` while `nameDraft` is still dirty.
   - Both `commitDisplayName` and `onBlur` **must** remain guarded by `isSavingName || isCommittingRef.current` (plus `skipBlurRef` for `Enter`/`Escape`).
3. **ESLint Cross-Feature Boundary (`eslint.config.js`)**:
   - Files under `src/features/profile/` **cannot** import from `src/app/` or any other `src/features/*` (including `auth` and `attachments`).
   - All auth/attachment operations (`authApi`, `useAuthStore`, `useLogout`, `useAttachmentUrl`, `uploadAttachment`) must stay in `src/app/pages/profile.tsx` and be passed down as props/callbacks.
4. **Dialog Reset Without Breaking Exit Animations**:
   - Never short-circuit Base UI `<Dialog>` with `if (!open) return null;` and do not toggle a `key` on `open ? 'open' : 'closed'`.
   - Gate `<Suspense>` with `session > 0` and pass the incrementing `sessionKey` to `*DialogBody` so exit animations play smoothly and the next open gets fresh form state.
5. **Column Width Alignment Between Hero & Grid**:
   - The friend code card in `ProfileHeroCard.tsx` (`lg:w-[20.5rem] xl:w-[22rem]`) is intentionally matched to the end column in `ProfilePageView.tsx` (`lg:grid-cols-[minmax(0,1fr)_20.5rem] xl:grid-cols-[minmax(0,1fr)_22rem]`). Update both together if column widths change.
6. **Mobile (`< md`) vs Desktop (`md:`+) Layout**:
   - On `< md`: `ProfileCompletionCard` steps collapse behind a bottom toggle bar; `ProfilePersonalInfoCard` and `ProfileSettingsCard` collapse behind full-header toggles; `ProfileTelegramCard` renders embedded inside `ProfileSettingsCard` while its standalone grid slot is `hidden md:block`.
   - On `md:`+: all three cards are always expanded in their dedicated grid slots.

---

## 4. Known Deferred / Pending Items

- Notification preference switches (`appNotifications`, `telegramNotifications`) are client-only toggles until backend preference endpoints exist.
- Telegram bot connect/disconnect shows an informational toast until backend Telegram linking endpoints exist.
- `passwordLastChangedLabel` is static placeholder copy (`backend` does not expose `password_updated_at`).
- `/home/wallet` route referenced by `ProfileWalletCard`, `HomeHeader`, and `sidebar.config.ts` awaits the Wallet page implementation in `src/app/router.tsx`.

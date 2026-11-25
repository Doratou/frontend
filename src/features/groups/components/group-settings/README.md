# Group Settings Architecture & Agent Reference

Quick-reference map for the Group Settings & Group Header feature (`feat/group-setting`). Read this before touching any file in `src/features/groups/` or `src/app/pages/group/dashboard.tsx` to avoid re-reading the entire module tree.

---

## 1. File Map

### Entry Point (Route Layer)

- `src/app/pages/group/dashboard.tsx`
  - Owns `useGroupSettings(groupId)`, `useGroupCoverImage(group)`, `isSettingsOpen`, `hasOpenedSettings`, and controlled `settingsSection` (`'overview' | 'members' | 'link' | 'archive'`).
  - Uses `useSyncExternalStore` + `matchMedia('(min-width: 768px)')` to mount **only** `GroupHeader` (desktop) or `GroupHeaderMobile` (mobile) — never both simultaneously.
  - Lazily loads `GroupSettingsDialog` via `React.lazy`, preloads it on `onPointerEnter` over the header, and passes `coverImage` down to avoid duplicate `blob:` URLs.
  - Bridges app/cross-feature dependencies (`useNavigate`, `useAuthStore`, `useSidebarStore`) into `GroupHeader*` via callbacks (`onBackClick`, `onMenuClick`, `onGroupExit`).

### Dialog Shell & Section Components

- `src/features/groups/components/GroupSettingsDialog.tsx`
  - Controlled shell (`section`, `onSectionChange`, `open`, `onOpenChange`, optional `coverImage`).
  - Renders desktop sidebar nav (`NavItem`) + mobile header card & tablist from a single memoized `sections` config.
  - Eagerly renders `OverviewSection`; **lazily loads** `MembersSection`, `InviteLinkSection`, `DangerZoneSection`, and `InviteMemberDialog` (`React.lazy` + `Suspense`).
  - Tracks `hasOpenedInvite` so `InviteMemberDialog` is not fetched until opened, yet stays mounted once opened so Base UI exit animations work.
- `src/features/groups/components/group-settings/GroupSettingsShared.tsx`
  - Pure UI primitives: `StatusChip`, `GroupAvatar` (presentational only — receives `title`, `src`, `onError`), and `InlineConfirm`.
- `src/features/groups/components/group-settings/OverviewSection.tsx`
  - Group cover upload (`<input type="file" accept="image/*">`, max `GROUP_COVER_MAX_BYTES = 5MB`), isolated `OverviewInfoForm` (keyed by `${group.id}-${group.title}-${group.description}` so saving info resets form state without remounting `GroupAvatar`), and read-only metadata `<dl>`.
- `src/features/groups/components/group-settings/MembersSection.tsx`
  - Member list with owner badge, invite button (`onInvite`), inline ownership transfer (`Crown` -> uses **`member.userId`**), and inline member removal (`Trash2` -> uses **`member.memberId`**).
- `src/features/groups/components/group-settings/InviteLinkSection.tsx`
  - Fetches `useGroupInviteLinks`, finds active link (`link.isActive && Boolean(link.token)`), renders copyable frontend URL (`/join/:token`), deactivate confirm, and create/update form (`PasswordField`, `NumberField`, `PersianDatePicker`).
  - Isolated in its own lazy chunk (`~300 kB` with `@daypicker/*` + `date-fns-jalali`) so it never bloats `/group/:groupId` initial load.
- `src/features/groups/components/group-settings/DangerZoneSection.tsx`
  - For **Owner**: one-way Archive (`ACTIVE -> SETTLING`) + permanent Delete (blocked if `CLOSED` or has settlements).
  - For **Member**: Leave group (blocked if `CLOSED`); triggers `onClose()` + `onGroupExit?.()` on success.
- `src/features/groups/components/InviteMemberDialog.tsx`
  - Direct-invite modal backed by `useFriendsList(open)` + `useInviteGroupMembers(groupId)`.
  - Filters out existing group members via `Set<userId>`, searches by name, renders selected chips in a `flex-wrap` container.

### Group Headers & Avatars

- `src/features/groups/components/GroupHeader.tsx` / `GroupHeaderMobile.tsx`
  - Pure presentational headers sharing `formatGroupStorage` (from `constants.ts`) and `GroupMemberStack` (from `MemberAvatar.tsx`).
  - Must **not** import from other features (e.g. `sidebar`, `auth`) or `react-router`.
- `src/features/groups/components/MemberAvatar.tsx`
  - Renders `member.avatarSrc` with `onError` fallback -> first-letter initial circle -> `<User />` icon. Also exports `GroupMemberStack`.
- `src/features/groups/components/groupHeaderAssets.ts`
  - Static imports for `banner.png`, `mobile-banner.png`, `group-photo-sample.png`, `creator-avatar-sample.png`.
- **No barrel file**: `components/index.ts` was intentionally removed (`bundle-barrel-imports`). Always import components directly from their file path.

### Data, Hooks & Contracts

- `src/features/groups/types.ts` — Lean domain types (`GroupSettingsData`, `GroupMemberItem`, `GroupInviteLink`, `FriendItem`, `DirectInviteResult`).
- `src/features/groups/constants.ts` — Status Persian labels, title/desc/cover/password limits, `getUtf8ByteLength`, `formatGroupStorage`.
- `src/features/groups/api/query-keys.ts` — TanStack Query keys (`groupKeys`).
- `src/features/groups/api/contracts.ts` — Zod DTO schemas + mappers (`mapGroupDtoToSettingsData`, `mapInviteLinkDto`, `mapFriendDto`, `mapDirectInviteResponse`).
- `src/features/groups/api/group-error.ts` — `GroupError` subclass of `ApiError`, backend error code -> Persian message map (`GROUP_*`, `INVITE_*`, `DIRECT_INVITE_*`), and `toGroupError`.
- `src/features/groups/api/group-settings-api.ts` — All HTTP calls using shared `apiClient` with `signal?: AbortSignal` and `withGroupError` (always returns rejected promises, never sync throws).
- `src/features/groups/hooks/use-group-settings.ts` — All React Query hooks, cover blob URL management (`useGroupCoverImage`), toast feedback, and cache invalidation.

---

## 2. Backend Endpoints & Query Cache Map

| Operation            | Method & Path                                                   | API Function                    | Hook                           | Cache Effect                                                                |
| -------------------- | --------------------------------------------------------------- | ------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| Fetch group detail   | `GET /groups/:groupId`                                          | `getGroupSettings`              | `useGroupSettings`             | `groupKeys.settings(groupId)`                                               |
| Download cover blob  | `GET /attachments/:id/download`                                 | `downloadGroupAttachment`       | `useGroupCoverImage`           | `groupKeys.coverBlob(id)` (`staleTime: 30m`)                                |
| Update title / desc  | `PATCH /groups/:groupId`                                        | `updateGroupInfo`               | `useUpdateGroupInfo`           | Invalidates `detail(id)` + `lists()`                                        |
| Upload & set cover   | `POST /attachments/upload` -> `PATCH /groups/:groupId/cover`    | `updateGroupCover`              | `useUpdateGroupCover`          | Sets `coverBlob(id)` + `settings(id)`, invalidates `detail(id)` + `lists()` |
| Remove member        | `DELETE /groups/:groupId/members/:memberId`                     | `removeGroupMember`             | `useRemoveGroupMember`         | Invalidates `detail(id)`                                                    |
| Transfer ownership   | `POST /groups/:groupId/transfer-ownership` (`{ new_owner_id }`) | `transferGroupOwnership`        | `useTransferGroupOwnership`    | Invalidates `detail(id)`                                                    |
| Leave group          | `DELETE /groups/:groupId/leave`                                 | `leaveGroup`                    | `useLeaveGroup`                | Removes `detail(id)`, invalidates `lists()`                                 |
| Archive group        | `POST /groups/:groupId/archive`                                 | `archiveGroup`                  | `useArchiveGroup`              | Invalidates `detail(id)` + `lists()`                                        |
| Delete group         | `DELETE /groups/:groupId`                                       | `deleteGroup`                   | `useDeleteGroup`               | Removes `detail(id)`, invalidates `lists()`                                 |
| List invite links    | `GET /invites/links/groups/:groupId`                            | `getGroupInviteLinks`           | `useGroupInviteLinks`          | `groupKeys.inviteLinks(groupId)`                                            |
| Create invite link   | `POST /invites/links/groups/:groupId`                           | `createGroupInviteLink`         | `useSaveGroupInviteLink`       | Invalidates `inviteLinks(id)` on settled                                    |
| Update link limits   | `PATCH /invites/links/groups/:groupId/:inviteId`                | `updateGroupInviteLinkInfo`     | `useSaveGroupInviteLink`       | Invalidates `inviteLinks(id)` on settled                                    |
| Change link password | `PATCH /invites/links/groups/:groupId/:inviteId/password`       | `changeGroupInviteLinkPassword` | `useSaveGroupInviteLink`       | Invalidates `inviteLinks(id)` on settled                                    |
| Deactivate link      | `DELETE /invites/links/groups/:groupId/:inviteId`               | `deactivateGroupInviteLink`     | `useDeactivateGroupInviteLink` | Optimistically filters `inviteLinks(id)` + invalidates                      |
| List friends         | `GET /friendships?page=1&limit=100`                             | `getFriendsList`                | `useFriendsList`               | `groupKeys.friends()`                                                       |
| Direct invite        | `POST /invites/direct` (`{ group_id, user_ids }`)               | `inviteGroupMembers`            | `useInviteGroupMembers`        | Invalidates `detail(id)`                                                    |

> **Key Prefix Rule**: `groupKeys.detail(groupId)` (`['groups', 'detail', groupId]`) is the prefix for `settings`, `members`, and `inviteLinks`. Invalidating `detail(groupId)` refreshes all three.

---

## 3. Role & Group Status Permissions

`GroupPlan` (`NORMAL | PREMIUM`) is independent of `GroupRole` (`OWNER | MEMBER`).

| Capability                           | `OWNER` + `ACTIVE`                 | `OWNER` + `SETTLING`           | `OWNER` + `CLOSED` | `MEMBER` + `ACTIVE/SETTLING` | `MEMBER` + `CLOSED` |
| ------------------------------------ | ---------------------------------- | ------------------------------ | ------------------ | ---------------------------- | ------------------- |
| Edit title, description, cover       | Yes                                | Yes                            | No                 | No                           | No                  |
| Invite friends (direct)              | Yes                                | No                             | No                 | No                           | No                  |
| Remove member / transfer ownership   | Yes                                | Yes                            | No                 | No                           | No                  |
| Create / edit / revoke invite link   | Yes                                | Yes                            | No                 | View & copy only             | View & copy only    |
| Archive group (`ACTIVE -> SETTLING`) | Yes                                | Already archived               | Closed             | No                           | No                  |
| Delete group permanently             | Yes (unless settlements exist)     | Yes (unless settlements exist) | No                 | No                           | No                  |
| Leave group                          | No (must transfer ownership first) | No                             | No                 | Yes                          | No                  |

---

## 4. Critical Invariants & Gotchas

1. **`memberId` vs `userId` (Do Not Mix)**:
   - `removeGroupMember` takes **`member.memberId`** (membership row ID).
   - `transferGroupOwnership`, `isOwner` check, and `InviteMemberDialog` existing-member filtering take **`member.userId`** (account user ID).
2. **Cover Image Loading Strategy**:
   - When `cover_attachment_id` exists, `contracts.ts` intentionally leaves `groupPhotoSrc = undefined` so `useGroupCoverImage` downloads `/attachments/:id/download` as an authenticated `Blob` (staging storage `access_url`s can be unreachable/SPA-rewritten).
   - After upload, `useUpdateGroupCover` seeds `groupKeys.coverBlob(id)` directly with the uploaded `File` for instant display.
   - Always pass `coverImage` from `dashboard.tsx` into `GroupSettingsDialog` (and `coverSrc` into `GroupAvatar`) rather than calling `useGroupCoverImage` per avatar.
3. **Invite Link Saving & Password Limits**:
   - Password validation enforces **both** `value.length >= 8` (chars) and `getUtf8ByteLength(value) <= 72` (bcrypt UTF-8 byte cap).
   - Updating an existing invite link runs `updateGroupInviteLinkInfo` then `changeGroupInviteLinkPassword` sequentially; if info succeeds and password fails, it throws `GroupError('INVITE_PARTIAL_UPDATE', ...)` and `onSettled` still refreshes `inviteLinks`.
   - Backend PATCH does not accept `null` to clear `max_uses` or `expires_at`; clearing a limit prompts the user to enter a new value or deactivate the link.
4. **Dialog Animation & Lazy Loading**:
   - Do **not** add `if (!open) return null;` inside `GroupSettingsDialog` or `InviteMemberDialog` — Base UI `<Dialog>` needs to stay mounted while closing to run `data-ending-style` transitions.
   - Instead, gate lazy `<Suspense>` mounting with sticky `hasOpenedSettings` / `hasOpenedInvite` flags.
5. **ESLint Architectural Boundaries (`eslint.config.js`)**:
   - Files under `src/features/groups/` **cannot** import from `src/app/` or any other `src/features/*` (such as `sidebar`, `auth`, `attachments`).
   - Files under `src/features/groups/api/` **cannot** import `components`, `hooks`, `react-router`, `react-hook-form`, `sonner`, or `motion`.
   - Component `.tsx` files must only export React components (and TypeScript `type`s) to satisfy `react-refresh/only-export-components`.
6. **Error Display**:
   - Use `getApiErrorMessage(error, { fallback })` from `@/lib/api/error` directly; `GroupError` extends `ApiError`, so mapped Persian messages flow through automatically. Ignore cancelled requests via `axios.isCancel(error)`.

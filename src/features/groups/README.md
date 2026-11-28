# اکیپ‌ها (`groups`)

قابلیت محوری مدیریت اکیپ‌ها شامل فهرست اکیپ‌ها و دعوت‌نامه‌ها (`/home/groups`)، داشبورد و هدر اکیپ (`/group/:groupId`) و مودال تنظیمات اکیپ.

برای جزئیات لایهٔ شبکه و تنظیمات کامل، این مستندات را نیز ببینید:

- [مستندات API اکیپ‌ها](./api/README.md)
- [معماری تنظیمات اکیپ و هدر](./components/group-settings/README.md)

## ساختار پوشه

- `types.ts` و `constants.ts` — مدل‌های اکیپ (`GroupItem`, `GroupSettingsData`, `GroupMemberItem`, `GroupInviteLink`, `FriendItem`, `GroupInvitation`)، برچسب‌های وضعیت، محدودیت فیلدها و `formatGroupStorage`.
- `member-tone.ts` — re-export از `@/utils/member-tone`.
- `api/` — قراردادها (`contracts.ts`)، خطاها (`group-error.ts`)، کلیدهای کش (`query-keys.ts`) و درخواست‌های فهرست/ساخت/دعوت/اعضا و تنظیمات.
- `hooks/`
  - `use-group-cover-photo.ts` — بارگذاری عکس کاور کارت اکیپ با استفاده از `getAttachmentUrl` و fallback به blob دانلود (`downloadGroupAttachment`).
  - `use-group-settings.ts` — هوک‌های TanStack Query تنظیمات اکیپ، لیست دوستان (`useFriendsList`) و مدیر تصویر کاور (`useGroupCoverImage` با استفاده از `@/hooks/use-attachment-url`).
  - `use-group-mutations.ts` — mutationهای پذیرش/رد دعوت‌نامه و ساخت/کلون اکیپ.
  - `use-group-id.ts` — re-export از `@/hooks/use-group-id`.
- `components/`
  - `list/` — نمای فهرست اکیپ‌ها (`GroupsView.tsx`)، کارت اکیپ با پشته آواتار اعضا (`GroupCard.tsx`)، کارت دعوت‌نامه (`GroupInvitationCard.tsx`)، نوار فیلتر/مرتب‌سازی آرشیو (`ArchivedToolbar.tsx`) و دیالوگ ساخت/کلون (`CreateGroupDialog.tsx`).
  - `GroupHeader.tsx`، `GroupHeaderMobile.tsx`، `MemberAvatar.tsx` (`GroupMemberStack`) و `groupHeaderAssets.ts`.
  - `GroupSettingsDialog.tsx`، `InviteMemberDialog.tsx` و زیربخش‌های `group-settings/` (`OverviewSection`, `MembersSection`, `InviteLinkSection`, `DangerZoneSection`).

# چک‌لیست اکیپ (`checklist`)

مدیریت آیتم‌های گروهی و وسایل شخصی در صفحهٔ چک‌لیست هر اکیپ (مسیر `/group/:groupId/checklist` در `src/app/pages/checklist.tsx`).

## ساختار فایل‌ها

- `config.ts` — محدودیت طول عنوان (`CHECKLIST_TITLE_MAX_LENGTH = 200`)، تب‌های فیلتر (`CHECKLIST_TABS`) و متادیتای بخش‌ها (`CHECKLIST_SECTIONS`).
- `schemas.ts` و `types.ts` — اعتبارسنجی فرم افزودن آیتم و مدل‌های `Checklist`, `ChecklistItem`, `ChecklistSectionKey`, `ChecklistTab`, `ChecklistSummary`.
- `format.ts` و `utils.ts` — فرمت شمارنده‌های فارسی (`formatItemCount`, `formatMemberCount`, `formatPercent`)، دسته‌بندی آیتم‌ها (`groupChecklistItems`, `getTabCounts`) و شناسهٔ دسترسی‌پذیری تب‌ها (`checklistTabId`).
- `api/`
  - `checklist-http.ts` — مسیرهای REST چک‌لیست (`/groups/:groupId/checklist...`)، `unwrap` مشترک از `@/lib/api/envelope` و `checklistRequest`.
  - `checklist-error.ts` — کلاس `ChecklistError` و نگاشت کدهای خطای بک‌اند (`CHECKLIST_*`, `GROUP_NOT_FOUND`, `USER_*`, `BAD_REQUEST`) با `extractApiErrorCode`.
  - `contracts.ts` — schemaهای DTO و تبدیل صفحه‌بندی چک‌لیست (`checklistPageSchema`).
  - `query-keys.ts` — `checklistKeys` (`all`, `group`, `detail`).
  - `get-checklist.ts` (`GET /groups/:groupId/checklist`), `create-checklist-item.ts` (`POST .../items`), `delete-checklist-item.ts` (`DELETE .../items/:itemId`), `claim-checklist-item.ts` (`PUT`/`DELETE .../claim`).
- `hooks/` — `use-create-checklist-item.ts`, `use-delete-checklist-item.ts`, `use-toggle-claim.ts`.
- `components/` — `checklist-view.tsx`, `checklist-status-card.tsx`, `checklist-member-shares.tsx`, `checklist-tabs.tsx`, `checklist-section.tsx`, `checklist-item-row.tsx`, `checklist-add-form.tsx`, `checklist-assignee-chip.tsx`, `checklist-avatar.tsx`.

## وابستگی‌های مشترک

- از `@/hooks/use-group-id` برای خواندن `groupId` و از `@/utils/member-tone` برای رنگ آواتار/سهم اعضا استفاده می‌کند.

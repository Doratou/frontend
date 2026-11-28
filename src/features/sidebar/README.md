# نوار کناری (`sidebar`)

نوار ناوبری ریسپانسیو برنامه که در دو حالت دسکتاپ (ریل جمع‌شونده در `md:`+) و موبایل (کشوی تمام‌صفحه/overlay در `< md`) برای دو زمینهٔ **`homepage`** (تم بنفش) و **`group`** (تم فیروزه‌ای) رندر می‌شود.

## ساختار فایل‌ها

- `components/Sidebar.tsx` — کامپوننت اصلی `Sidebar`، مدیریت جمع/باز شدن دسکتاپ (متصل به `useSidebarStore` در `@/stores/sidebar-store`)، drawer موبایل، دکمهٔ «بازگشت به خانه» در صفحات گروه و لایه‌های پس‌زمینه (`SidebarArtworkLayer`) با مقیاس‌دهی متناسب در نمایشگرهای بزرگ.
- `components/sidebar.config.ts` — لیست آیتم‌های ناوبری `SIDEBAR_NAV_ITEMS` برای `homepage` (داشبورد، اکیپ‌ها، خاطرات، دوستان، کیف پول، پروفایل) و `group` (داشبورد، هزینه‌ها و دنگ، چک‌لیست، نظرسنجی، قرعه‌کشی، گالری، همیار)، و کلاس‌های تم `SIDEBAR_PAGE_THEME`.
- `components/sidebarAssets.ts` — نگاشت فایل‌های SVG پس‌زمینه و لوگو برای حالت باز و بسته (`getBackground`, `getLogo`).
- `components/SidebarTooltip.tsx` — `SidebarTooltipProvider` و `SidebarTooltip` بر پایهٔ `@base-ui/react/tooltip` برای نمایش عنوان آیتم‌ها هنگام جمع‌بودن سایدبار.

> نکته: برخی مسیرهای تعریف‌شده در `SIDEBAR_NAV_ITEMS` (مانند `/home/`، `/home/memories`، `/home/friends`، `coins` و `gallery`) هنوز صفحهٔ کامل در `src/app/router.tsx` ندارند و به‌عنوان آیتم‌های منوی محصول حفظ شده‌اند.

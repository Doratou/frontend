# هدر خانه (`home-header`)

نوار بالای صفحات خانه (`/home/*`) شامل عنوان صفحه، دکمهٔ بازکردن منوی موبایل، پاپ‌اور اعلانات اخیر و منوی کاربری پروفایل. این ماژول کاملاً نمایشی است و از طریق callback و slotها به داده‌های برنامه (در `src/app/layouts/AppHomeHeader.tsx`) متصل می‌شود.

## ساختار فایل‌ها

- `types.ts` — اینترفیس‌های `HomeHeaderUser`, `HeaderNotificationItem`, `HeaderNotificationType` و `HomeHeaderProps`.
- `components/`
  - `HomeHeader.tsx` — رندر هدر، مدیریت وضعیت باز/بسته‌بودن منوها (`'profile' | 'notifications' | null`)، بستن با کلیک بیرون یا کلید `Escape`، بازگرداندن فوکوس به دکمهٔ ماشه، انیمیشن منو با Motion (با رعایت `prefers-reduced-motion`) و فراهم‌کردن context.
  - `home-header-context.ts` — `HomeHeaderMenuContext` و هوک دسترسی برای بستن منو از داخل آیتم‌های زیرمجموعه.
  - `ProfileMenu.tsx` — منوی کشویی اطلاعات کاربر، لینک پروفایل/تنظیمات و دکمهٔ خروج.
  - `NotificationsMenu.tsx` — پیش‌نمایش اعلانات جدید و لینک مشاهدهٔ همه در `/home/notification`.

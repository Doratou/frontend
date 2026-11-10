// src/components/Sidebar/sidebarAssets.ts

export type SidebarPage = 'homepage' | 'ekeeps';
export type SidebarMode = 'open' | 'closed';

// تصویر شفاف ۱×۱ پیکسل موقت برای جلوگیری از خطای Build قبل از قرارگیری فایل‌های واقعی
const TRANSPARENT_PNG_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/*
 * TODO: پس از قرار دادن فایل‌های واقعی در پوشه src/assets/sidebar/،
 * ایمپورت‌های زیر را از کامنت خارج کنید و در آبجکت‌های پایین جایگزین TRANSPARENT_PNG_PLACEHOLDER نمایید:
 *
 * import bgHomepageOpen from '../../assets/sidebar/bg-homepage-open.png';
 * import bgHomepageClosed from '../../assets/sidebar/bg-homepage-closed.png';
 * import bgEkeepsOpen from '../../assets/sidebar/bg-ekeeps-open.png';
 * import bgEkeepsClosed from '../../assets/sidebar/bg-ekeeps-closed.png';
 * import bgEkeepsOpenMask from '../../assets/sidebar/bg-ekeeps-open-mask.png';
 * import bgEkeepsClosedMask from '../../assets/sidebar/bg-ekeeps-closed-mask.png';
 * import logoOpen from '../../assets/sidebar/logo-open.png';
 * import logoClosedHomepage from '../../assets/sidebar/logo-closed-homepage.png';
 * import logoClosedEkeeps from '../../assets/sidebar/logo-closed-ekeeps.png';
 */

import bgHomeOpen from '../../../assets/sidebar/home-open.svg';
import bgHomeClose from '../../../assets/sidebar/home-close.svg';
import bgEkeepOpen from '../../../assets/sidebar/ekeep-open.svg';
import bgEkeepClose from '../../../assets/sidebar/ekeep-close.svg';
import logoSidebarOpen from '../../../assets/sidebar/logo-sidebar-open.svg';
import logoSidebarClose from '../../../assets/sidebar/logo-sidebar-close.svg';

const BACKGROUNDS: Record<SidebarPage, Record<SidebarMode, string>> = {
  homepage: {
    open: bgHomeOpen, // bg-homepage-open.png (350×992)
    closed: bgHomeClose, // bg-homepage-closed.png (100×992)
  },
  ekeeps: {
    open: bgEkeepOpen, // bg-ekeeps-open.png (350×1024)
    closed: bgEkeepClose, // bg-ekeeps-closed.png (100×1024)
  },
};

const EKEEPS_MASKS: Record<SidebarMode, string> = {
  open: TRANSPARENT_PNG_PLACEHOLDER, // bg-ekeeps-open-mask.png (350×396)
  closed: TRANSPARENT_PNG_PLACEHOLDER, // bg-ekeeps-closed-mask.png (100×400)
};

const LOGOS = {
  open: logoSidebarOpen, // logo-open.png (80×85)
  closed: {
    homepage: logoSidebarClose, // logo-closed-homepage.png (60×64)
    ekeeps: logoSidebarClose, // logo-closed-ekeeps.png (60×64)
  },
};

export function getBackground(page: SidebarPage, mode: SidebarMode): string {
  return BACKGROUNDS[page][mode];
}

export function getEkeepsMask(mode: SidebarMode): string {
  return EKEEPS_MASKS[mode];
}

export function getLogo(page: SidebarPage, mode: SidebarMode): string {
  if (mode === 'open') return LOGOS.open;
  return LOGOS.closed[page];
}

export type SidebarPage = 'homepage' | 'group';
export type SidebarMode = 'open' | 'closed';

import bgHomeOpen from '../../../assets/sidebar/home-open.svg';
import bgHomeClose from '../../../assets/sidebar/home-close.svg';
import bgGroupOpen from '../../../assets/sidebar/group-open.svg';
import bgGroupClose from '../../../assets/sidebar/group-close.svg';
import logoSidebarOpen from '../../../assets/sidebar/logo-sidebar-open.svg';
import logoSidebarClose from '../../../assets/sidebar/logo-sidebar-close.svg';

const BACKGROUNDS: Record<SidebarPage, Record<SidebarMode, string>> = {
  homepage: {
    open: bgHomeOpen, // bg-homepage-open.png (350×992)
    closed: bgHomeClose, // bg-homepage-closed.png (100×992)
  },
  group: {
    open: bgGroupOpen, // bg-group-open.png (350×1024)
    closed: bgGroupClose, // bg-group-closed.png (100×1024)
  },
};

const LOGOS = {
  open: logoSidebarOpen, // logo-open.png (80×85)
  closed: {
    homepage: logoSidebarClose, // logo-closed-homepage.png (60×64)
    group: logoSidebarClose, // logo-closed-group.png (60×64)
  },
};

export function getBackground(page: SidebarPage, mode: SidebarMode): string {
  return BACKGROUNDS[page][mode];
}

export function getLogo(page: SidebarPage, mode: SidebarMode): string {
  if (mode === 'open') return LOGOS.open;
  return LOGOS.closed[page];
}

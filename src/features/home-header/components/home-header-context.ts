import { createContext, use } from 'react';

export interface HomeHeaderMenuContextValue {
  closeMenu: () => void;
  profileMenuId: string;
  notificationsMenuId: string;
}

export const HomeHeaderMenuContext =
  createContext<HomeHeaderMenuContextValue | null>(null);

export function useHomeHeaderMenu() {
  return use(HomeHeaderMenuContext);
}

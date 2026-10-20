import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export const themeStorageKey = 'dorato-theme';

export const ThemeContext = createContext<{
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
} | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme requires ThemeProvider.');
  return context;
}

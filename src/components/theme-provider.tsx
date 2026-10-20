import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { ThemeContext, themeStorageKey, type Theme } from '@/lib/theme';

const systemThemeQuery = '(prefers-color-scheme: dark)';

function subscribe(listener: () => void) {
  const media = window.matchMedia(systemThemeQuery);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}

function readPreference(): Theme {
  try {
    const value = localStorage.getItem(themeStorageKey);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    /* The theme still works when browser storage is disabled. */
  }
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, updateTheme] = useState<Theme>(readPreference);
  const systemDark = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(systemThemeQuery).matches,
  );
  const resolvedTheme =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  function setTheme(next: Theme) {
    updateTheme(next);
    try {
      localStorage.setItem(themeStorageKey, next);
    } catch {
      /* Appearance preferences are optional. */
    }
  }

  return (
    <ThemeContext value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext>
  );
}

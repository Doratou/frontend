import type { ComponentProps, CSSProperties } from 'react';
import { useTheme } from '@/lib/theme';
import { Toaster as Sonner } from 'sonner';

export function Toaster(props: ComponentProps<typeof Sonner>) {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      dir="rtl"
      position="bottom-center"
      closeButton
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as CSSProperties
      }
      {...props}
    />
  );
}

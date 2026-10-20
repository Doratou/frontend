import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { DirectionProvider } from '@radix-ui/react-direction';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { createQueryClient } from '@/lib/query-client';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DirectionProvider dir="rtl">
          {children}
          <Toaster />
        </DirectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

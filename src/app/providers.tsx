import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { DirectionProvider } from '@radix-ui/react-direction';
import { ThemeProvider } from '@/components/theme-provider';
import { CustomToast } from '@/components/custom/custom-toast';
import { createQueryClient } from '@/lib/query-client';
import { AuthSession } from '@/features/auth/components/auth-session';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DirectionProvider dir="rtl">
          <AuthSession />
          {children}
          <CustomToast />
        </DirectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

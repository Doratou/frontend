import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  render() {
    if (this.state.failed)
      return (
        <main className="grid min-h-svh place-content-center gap-5 p-6 text-center">
          <h1 className="text-2xl font-bold">مشکلی در نمایش صفحه پیش آمد</h1>
          <p className="text-muted-foreground">صفحه را دوباره بارگذاری کنید.</p>
          <Button onClick={() => window.location.reload()}>
            بارگذاری دوباره
          </Button>
        </main>
      );
    return this.props.children;
  }
}

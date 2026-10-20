import { Link, Outlet } from 'react-router';
import { UsersRound } from 'lucide-react';
import { ThemeToggle } from '@/components/custom/theme-toggle';

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 rounded bg-primary p-3 text-primary-foreground focus:not-sr-only focus:absolute"
      >
        رفتن به محتوا
      </a>
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            aria-label="دوراتو، صفحه اصلی"
            className="flex items-center gap-3"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <UsersRound className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-extrabold">دوراتو</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 outline-none sm:py-20"
      >
        <Outlet />
      </main>
      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        برای باهم بودن، از برنامه تا خاطره.
      </footer>
    </div>
  );
}

import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Button } from '@/components/ui/button';

export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="grid min-h-svh place-content-center gap-5 px-6 text-center">
      <h1 className="text-2xl font-bold">
        {notFound ? 'این صفحه پیدا نشد' : 'مشکلی در بارگذاری صفحه پیش آمد'}
      </h1>
      <p className="text-muted-foreground">کمی بعد دوباره تلاش کنید.</p>
      <Button asChild>
        <a href="/">بازگشت به خانه</a>
      </Button>
    </main>
  );
}

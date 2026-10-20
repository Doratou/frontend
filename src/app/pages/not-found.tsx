import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function Component() {
  return (
    <section className="space-y-5 py-12 text-center">
      <p className="text-sm text-muted-foreground">۴۰۴</p>
      <h1 className="text-3xl font-bold">این صفحه پیدا نشد</h1>
      <p className="text-muted-foreground">
        آدرس را بررسی کنید یا به صفحه اصلی برگردید.
      </p>
      <Button asChild>
        <Link to="/">بازگشت به خانه</Link>
      </Button>
    </section>
  );
}

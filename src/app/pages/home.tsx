import { ArrowUpLeft, Camera, ReceiptText, UsersRound } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

const highlights = [
  {
    icon: UsersRound,
    title: 'یک اکیپ، یک برنامه',
    text: 'دوستانت را دور هم جمع کن و برای برنامه بعدی هماهنگ شو.',
  },
  {
    icon: ReceiptText,
    title: 'حساب‌وکتاب روشن',
    text: 'هزینه‌های مشترک و سهم هر نفر، کنار جزئیات همان برنامه.',
  },
  {
    icon: Camera,
    title: 'خاطره‌هایی که می‌مانند',
    text: 'عکس‌ها و لحظه‌های مشترک، یک‌جا کنار هم.',
  },
];

export function Component() {
  return (
    <>
      <section className="max-w-3xl space-y-7">
        <span className="inline-flex rounded-full border bg-card px-4 py-2 text-xs text-muted-foreground">
          نسخه اولیه · در حال توسعه
        </span>
        <h1 className="text-4xl leading-relaxed font-extrabold tracking-tight sm:text-6xl sm:leading-snug">
          قرار بعدی با شما،
          <br />
          <span className="text-primary">دورهمی با دوراتو.</span>
        </h1>
        <p className="max-w-xl text-lg leading-9 text-muted-foreground">
          از هماهنگی سفر و دورهمی تا تقسیم هزینه‌ها و نگه‌داشتن خاطره‌ها؛ همه در
          فضای مشترک اکیپ شما.
        </p>
        <Button asChild>
          <Link to="/login">
            روش‌های ورود <ArrowUpLeft aria-hidden="true" />
          </Link>
        </Button>
      </section>
      <section
        aria-label="امکانات پیش روی دوراتو"
        className="mt-16 grid gap-4 sm:grid-cols-3"
      >
        {highlights.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="space-y-4 rounded-2xl border bg-card p-6"
          >
            <span className="inline-flex rounded-xl bg-accent p-3 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm leading-7 text-muted-foreground">{text}</p>
          </article>
        ))}
      </section>
    </>
  );
}

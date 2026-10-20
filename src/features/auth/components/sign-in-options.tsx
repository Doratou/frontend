import { KeyRound, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AuthMethod } from '@/features/auth/types';

const methods = [
  { id: 'otp', label: 'شماره موبایل و کد یک‌بارمصرف', icon: Smartphone },
  { id: 'password', label: 'ایمیل و رمز عبور', icon: Mail },
  { id: 'google', label: 'حساب گوگل', icon: KeyRound },
] satisfies { id: AuthMethod; label: string; icon: typeof Mail }[];

export function SignInOptions() {
  return (
    <section
      aria-labelledby="sign-in-title"
      className="mx-auto max-w-md space-y-7 rounded-3xl border bg-card p-6 sm:p-10"
    >
      <div className="space-y-3">
        <h1 id="sign-in-title" className="text-2xl font-bold">
          ورود به دوراتو
        </h1>
        <p
          id="sign-in-status"
          className="text-sm leading-7 text-muted-foreground"
        >
          ورود هنوز فعال نشده است. به‌زودی می‌توانید با یکی از این سه روش وارد
          حساب خود شوید.
        </p>
      </div>
      <div className="space-y-3">
        {methods.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            disabled
            variant="outline"
            aria-describedby="sign-in-status"
            className="w-full justify-start"
          >
            <Icon aria-hidden="true" />
            {label}
          </Button>
        ))}
      </div>
    </section>
  );
}

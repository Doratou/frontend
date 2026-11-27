import { useState } from 'react';
import { Link, useLocation, useMatches, useOutlet } from 'react-router';
import doratoMark from '@/assets/auth/dorato-mark.png';
import type {
  OtpChallenge,
  RegistrationInput,
  ResetGrant,
} from '@/features/auth/api/contracts';
import type { AuthView } from '@/features/auth/config';
import { AuthTransition } from './auth-transition';
import './auth.css';

export function Component() {
  const location = useLocation();
  const view = useMatches().at(-1)?.handle as AuthView;
  const isLogin = location.pathname.startsWith('/login');
  const [identifier, setIdentifier] = useState('');
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [registration, setRegistration] = useState<RegistrationInput | null>(
    null,
  );
  const [resetGrant, setResetGrant] = useState<ResetGrant | null>(null);
  const outlet = useOutlet({
    view,
    identifier,
    setIdentifier,
    challenge,
    setChallenge,
    registration,
    setRegistration,
    resetGrant,
    setResetGrant,
  });

  return (
    <div className="auth-layout relative isolate flex flex-col items-center bg-background">
      <a
        href="#auth-content"
        className="sr-only z-10 bg-card p-3 focus:not-sr-only focus:absolute"
      >
        رفتن به فرم
      </a>
      <div className="auth-backdrop" aria-hidden="true" />
      <Link
        to="/"
        className="auth-brand flex flex-none items-center no-underline outline-offset-4"
        aria-label="دوراتو، صفحه اصلی"
      >
        <img
          src={doratoMark}
          width="136"
          height="136"
          className="size-(--auth-brand-size) dark:brightness-200"
          alt=""
        />
        <span className="text-(length:--auth-wordmark-size) leading-[1.35] font-extrabold text-primary-70 md:font-black dark:text-primary-30">
          دوراتو
        </span>
      </Link>
      <main id="auth-content" className="auth-card">
        <AuthTransition
          transitionKey={isLogin ? '/login' : location.pathname}
          animateHeight={!isLogin}
        >
          {outlet}
        </AuthTransition>
      </main>
      <div className="auth-mobile-art" aria-hidden="true" />
    </div>
  );
}

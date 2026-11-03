import { useEffect, useRef, type CSSProperties } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ExternalToast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import './custom-toast.css';

export function CustomToast() {
  return (
    <Toaster
      className="dorato-toaster"
      position="top-center"
      expand
      visibleToasts={4}
      gap={12}
      duration={5000}
      mobileOffset={16}
      containerAriaLabel="اعلان‌ها"
      toastOptions={{ closeButtonAriaLabel: 'بستن اعلان' }}
      icons={{
        success: <CircleCheck aria-hidden="true" />,
        info: <Info aria-hidden="true" />,
        warning: <TriangleAlert aria-hidden="true" />,
        error: <CircleAlert aria-hidden="true" />,
      }}
      style={
        {
          '--width': '26rem',
          '--normal-border':
            'color-mix(in srgb, var(--foreground) 14%, var(--popover))',
          fontFamily: 'var(--font-sans)',
        } as CSSProperties
      }
    />
  );
}

export function ToastContent({
  description,
  duration,
  onElapsed,
}: {
  description?: ExternalToast['description'];
  duration: number;
  onElapsed: () => void;
}) {
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = line.current;
    const container = element?.closest('[data-sonner-toaster]');
    const card = element?.closest('[data-sonner-toast]');
    if (!element || !container) return;

    const animation = element.animate(
      [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
      { duration, fill: 'forwards' },
    );
    let stopped = false;
    const sync = () => {
      if (stopped) return;
      if (document.hidden || container.matches(':hover, :focus-within'))
        animation.pause();
      else animation.play();
    };
    const afterBlur = () => queueMicrotask(sync);
    animation.onfinish = () => {
      if (card?.getAttribute('data-removed') !== 'true') onElapsed();
    };
    container.addEventListener('mouseenter', sync);
    container.addEventListener('mouseleave', sync);
    container.addEventListener('focusin', sync);
    container.addEventListener('focusout', afterBlur);
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      stopped = true;
      animation.cancel();
      container.removeEventListener('mouseenter', sync);
      container.removeEventListener('mouseleave', sync);
      container.removeEventListener('focusin', sync);
      container.removeEventListener('focusout', afterBlur);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [duration, onElapsed]);

  return (
    <>
      {typeof description === 'function' ? description() : description}
      {Number.isFinite(duration) && (
        <span className="dorato-toast-timer" aria-hidden="true">
          <span ref={line} />
        </span>
      )}
    </>
  );
}

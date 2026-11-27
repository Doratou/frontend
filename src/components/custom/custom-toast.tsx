import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ExternalToast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import './custom-toast.css';

export function CustomToast() {
  const [host] = useState(() =>
    typeof document === 'undefined' ? null : document.createElement('div'),
  );

  useEffect(() => {
    if (!host) return;
    host.setAttribute('data-dorato-toast-host', '');
    let dialogs = Array.from(
      document.querySelectorAll<HTMLDialogElement>('dialog:modal'),
    );
    const focusedDialog =
      document.activeElement?.closest<HTMLDialogElement>('dialog:modal');
    if (focusedDialog)
      dialogs = [
        ...dialogs.filter((dialog) => dialog !== focusedDialog),
        focusedDialog,
      ];
    const sync = (records: MutationRecord[] = []) => {
      for (const record of records) {
        if (
          record.type !== 'attributes' ||
          !(record.target instanceof HTMLDialogElement)
        )
          continue;
        const dialog = record.target;
        dialogs = dialogs.filter((item) => item !== dialog);
        if (dialog.matches(':modal')) dialogs.push(dialog);
      }
      dialogs = dialogs.filter(
        (dialog) => dialog.isConnected && dialog.matches(':modal'),
      );
      const container = dialogs.at(-1) ?? document.body;
      // Native modal dialogs outrank every document z-index; retain one stable toast host inside the top modal.
      if (host.parentElement !== container) container.appendChild(host);
    };
    const observer = new MutationObserver((records) => {
      if (
        records.some((record) => record.type === 'attributes') ||
        !host.parentElement?.isConnected
      )
        sync(records);
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open'],
    });
    sync();
    return () => {
      observer.disconnect();
      host.remove();
    };
  }, [host]);

  return host
    ? createPortal(
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
        />,
        host,
      )
    : null;
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

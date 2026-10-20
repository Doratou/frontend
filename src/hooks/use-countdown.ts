import { useCallback, useSyncExternalStore } from 'react';

// The caller supplies the server's deadline; this hook never invents an OTP expiry.
export function useCountdown(deadline: number | null): number {
  const getSnapshot = useCallback(() => {
    if (deadline === null || !Number.isFinite(deadline)) return 0;
    return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  }, [deadline]);

  const subscribe = useCallback(
    (notify: () => void) => {
      if (
        deadline === null ||
        !Number.isFinite(deadline) ||
        deadline <= Date.now()
      )
        return () => {};

      const tick = () => {
        notify();
        if (deadline <= Date.now()) window.clearInterval(interval);
      };
      const interval = window.setInterval(tick, 1000);
      document.addEventListener('visibilitychange', tick);
      return () => {
        window.clearInterval(interval);
        document.removeEventListener('visibilitychange', tick);
      };
    },
    [deadline],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

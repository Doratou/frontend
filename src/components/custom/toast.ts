import { createElement } from 'react';
import { toast as sonnerToast, type ExternalToast } from 'sonner';
import { ToastContent } from './custom-toast';

function showToast(
  variant: 'success' | 'info' | 'warning' | 'error',
  title: Parameters<typeof sonnerToast>[0],
  options: ExternalToast = {},
) {
  const { description, duration = 5000, onAutoClose, ...rest } = options;
  let autoClosed = false;
  const id = sonnerToast[variant](title, {
    ...rest,
    onDismiss: (item) => {
      if (!autoClosed) options.onDismiss?.(item);
    },
    // One animation owns both the progress line and expiry, including pauses.
    duration: Infinity,
    description: createElement(ToastContent, {
      description,
      duration: Math.max(0, duration),
      onElapsed: () => {
        autoClosed = true;
        const item = sonnerToast.getToasts().find((item) => item.id === id);
        sonnerToast.dismiss(id);
        if (item) onAutoClose?.(item);
      },
    }),
  });
  return id;
}

export const toast = {
  success: (title, options = {}) => showToast('success', title, options),
  info: (title, options = {}) => showToast('info', title, options),
  warning: (title, options = {}) => showToast('warning', title, options),
  error: (title, options = {}) => showToast('error', title, options),
  dismiss: sonnerToast.dismiss,
} satisfies Pick<
  typeof sonnerToast,
  'success' | 'info' | 'warning' | 'error' | 'dismiss'
>;

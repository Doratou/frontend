import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Custom text tokens are font sizes, otherwise text-color utilities remove them.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display-1',
        'display-2',
        'display-3',
        'heading-1',
        'heading-2',
        'heading-3',
        'heading-4',
        'heading-5',
        'heading-6',
        'heading-mobile-1',
        'heading-mobile-2',
        'heading-mobile-3',
        'heading-mobile-4',
        'heading-mobile-5',
        'heading-mobile-6',
        'button-sm',
        'button-md',
        'button-lg',
        'button-xl',
        'paragraph-sm',
        'paragraph-md',
        'paragraph-lg',
        'caption',
        'caption-light',
        'label-sm',
        'label-md',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

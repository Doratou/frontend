import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface PasswordChangedSuccessProps {
  title?: string;
  description?: string;
  action: ReactNode;
  className?: string;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function PasswordChangedSuccess({
  title = 'رمز عبور با موفقیت تغییر کرد',
  description = 'رمز عبور شما به‌روزرسانی شد. اکنون می‌توانید با رمز عبور جدید وارد شوید.',
  action,
  className,
}: PasswordChangedSuccessProps) {
  const reduced = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center px-2 py-6 text-center sm:py-8',
        className,
      )}
    >
      <div className="relative mb-6 flex size-28 items-center justify-center">
        {!reduced && (
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1.32, opacity: [0, 0.55, 0] }}
            transition={{ duration: 0.95, delay: 0.22, ease: EASE_OUT }}
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary-40/60"
          />
        )}

        <motion.div
          aria-hidden="true"
          initial={reduced ? false : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.45, ease: EASE_OUT }}
          className="flex size-28 items-center justify-center rounded-full bg-primary-10/90 dark:bg-primary-80/25"
        >
          <motion.div
            initial={reduced ? false : { scale: 0.65, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: reduced ? 0 : 0.4,
              delay: reduced ? 0 : 0.08,
              ease: EASE_OUT,
            }}
            className="flex size-20 items-center justify-center rounded-full bg-white shadow-xs dark:bg-card"
          >
            <motion.div
              initial={reduced ? false : { scale: 0, rotate: -18 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: 320,
                      damping: 18,
                      delay: 0.16,
                    }
              }
              className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-primary-50 to-primary-70 text-white shadow-[0_8px_20px_-4px_color-mix(in_srgb,var(--color-primary-60)_55%,transparent)]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-6"
                aria-hidden="true"
              >
                <motion.path
                  d="M5.5 12.5L10 17L18.5 7.5"
                  stroke="currentColor"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: reduced ? 0 : 0.38,
                    delay: reduced ? 0 : 0.32,
                    ease: EASE_OUT,
                  }}
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.h2
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduced ? 0 : 0.4,
          delay: reduced ? 0 : 0.26,
          ease: EASE_OUT,
        }}
        className="text-heading-4 font-extrabold text-primary-90 sm:text-heading-3 dark:text-primary-10"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduced ? 0 : 0.4,
          delay: reduced ? 0 : 0.36,
          ease: EASE_OUT,
        }}
        className="mt-2.5 max-w-[30ch] text-paragraph-sm leading-relaxed text-muted-foreground"
      >
        {description}
      </motion.p>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduced ? 0 : 0.35,
          delay: reduced ? 0 : 0.46,
          ease: EASE_OUT,
        }}
        className="mt-7"
      >
        {action}
      </motion.div>
    </div>
  );
}

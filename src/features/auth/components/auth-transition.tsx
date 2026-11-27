import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from 'motion/react';

function FormTransition({
  children,
  onEntered,
}: {
  children: ReactNode;
  onEntered: () => void;
}) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return (
    <motion.div
      inert={!present}
      aria-hidden={!present || undefined}
      initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : -20 }}
      transition={{ duration: reduced ? 0 : 0.4, ease: 'easeInOut' }}
      onAnimationComplete={() => {
        if (present) onEntered();
      }}
    >
      {children}
    </motion.div>
  );
}

export function AuthTransition({
  children,
  transitionKey,
  animateHeight = true,
}: {
  children: ReactNode;
  transitionKey: string;
  animateHeight?: boolean;
}) {
  const content = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [settledKey, setSettledKey] = useState(transitionKey);
  const changingForm = settledKey !== transitionKey;
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next =
        entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
      // Keep the previous height between the outgoing and incoming forms.
      if (next > 0) setHeight(next + 16);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <motion.div
      initial={false}
      animate={{
        height: changingForm && animateHeight ? (height ?? 'auto') : 'auto',
      }}
      transition={{
        duration: reduced || !animateHeight || !changingForm ? 0 : 0.4,
        ease: 'easeInOut',
      }}
      className="-m-2 overflow-hidden p-2"
    >
      <div ref={content}>
        <AnimatePresence mode="wait" initial={false}>
          <FormTransition
            key={transitionKey}
            onEntered={() => setSettledKey(transitionKey)}
          >
            {children}
          </FormTransition>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

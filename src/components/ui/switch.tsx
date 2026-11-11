import type { ComponentProps } from 'react';
import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { cn } from '@/lib/utils';

export function Switch({
  className,
  ...props
}: Omit<ComponentProps<typeof SwitchPrimitive.Root>, 'className'> & {
  className?: string;
}) {
  return (
    // dir="ltr" keeps the thumb physical: it moves to the right when checked, as in the design.
    <SwitchPrimitive.Root
      dir="ltr"
      data-slot="switch"
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-neutral-30 p-0.5 outline-hidden transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-checked:bg-secondary-60 data-disabled:cursor-not-allowed data-disabled:opacity-50 motion-reduce:transition-none',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 rounded-full bg-white shadow-sm transition-transform data-checked:translate-x-5 motion-reduce:transition-none" />
    </SwitchPrimitive.Root>
  );
}

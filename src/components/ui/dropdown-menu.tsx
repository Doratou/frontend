import type { ComponentProps } from 'react';
import { Menu } from '@base-ui/react/menu';
import { cn } from '@/lib/utils';

type WithClassName<T> = Omit<T, 'className'> & { className?: string };

export const DropdownMenu = Menu.Root;

export function DropdownMenuTrigger(
  props: WithClassName<ComponentProps<typeof Menu.Trigger>>,
) {
  return <Menu.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

export function DropdownMenuContent({
  className,
  children,
  ...props
}: WithClassName<ComponentProps<typeof Menu.Popup>>) {
  return (
    <Menu.Portal>
      {/* z-60 keeps the menu above dialogs (z-50). */}
      <Menu.Positioner sideOffset={4} align="start" className="z-60">
        {/* Portal content does not inherit dir from the layout wrapper; the app is RTL-only for now. */}
        <Menu.Popup
          dir="rtl"
          className={cn(
            'min-w-40 rounded-xl border border-neutral-20 bg-background p-1 text-foreground shadow-lg outline-hidden',
            className,
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: WithClassName<ComponentProps<typeof Menu.Item>>) {
  return (
    <Menu.Item
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-button-sm outline-hidden data-highlighted:bg-primary-10',
        className,
      )}
      {...props}
    />
  );
}

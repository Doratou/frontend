import { useRef, useState, type ReactElement, type ReactNode } from 'react';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Drawer } from '@base-ui/react/drawer';
import { Popover } from '@base-ui/react/popover';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

const headingClassName =
  'dorato-picker-heading flex items-center justify-between gap-2 px-1 pb-2.5';

// PersianLabs' responsive picker composition, using the already installed Base UI primitives.
export function PickerPopup({
  open,
  onOpenChange,
  label,
  disabled,
  renderField,
  renderTrigger,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  disabled?: boolean;
  renderField: (trigger: ReactElement) => ReactNode;
  renderTrigger?: () => ReactElement;
  children: (container: HTMLElement | null) => ReactNode;
}) {
  const mobile = useMediaQuery(
    '(max-width: 639px), (hover: none) and (pointer: coarse)',
  );
  const anchor = useRef<HTMLButtonElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const change = (next: boolean) => {
    if (next)
      setContainer(
        anchor.current?.closest<HTMLDialogElement>('dialog:modal') ?? null,
      );
    onOpenChange(next);
  };
  const button = renderTrigger?.() ?? (
    <Button
      size="icon"
      variant="ghost"
      radius="md"
      className="dorato-picker-open size-10 p-0 text-primary-60 max-sm:min-h-11 max-sm:min-w-11 pointer-coarse:min-h-11 pointer-coarse:min-w-11 [&_svg]:size-4.75"
      aria-label={`باز کردن ${label}`}
    />
  );
  const trigger = mobile ? (
    <Drawer.Trigger ref={anchor} disabled={disabled} render={button} />
  ) : (
    <Popover.Trigger ref={anchor} disabled={disabled} render={button} />
  );
  const Close = mobile ? Drawer.Close : Popover.Close;
  const close = (
    <Close
      render={
        <Button
          size="icon"
          variant="ghost"
          radius="md"
          className="size-9 max-sm:min-h-11 max-sm:min-w-11 pointer-coarse:min-h-11 pointer-coarse:min-w-11 [&_svg]:size-4.5"
          aria-label="بستن انتخابگر"
        />
      }
    >
      <X aria-hidden="true" />
    </Close>
  );
  return (
    <DirectionProvider direction="rtl">
      {mobile ? (
        <Drawer.Root open={open} onOpenChange={change} swipeDirection="down">
          {renderField(trigger)}
          <Drawer.Portal container={container ?? undefined}>
            <Drawer.Backdrop className="fixed inset-0 z-80 bg-primary-80/30" />
            <Drawer.Viewport className="fixed inset-0 z-81 flex items-end justify-center">
              <Drawer.Popup
                className="dorato-picker-drawer max-h-[calc(100dvh_-_24px)] w-full translate-y-[var(--drawer-swipe-movement-y,0px)] overflow-y-auto overscroll-contain rounded-t-[20px] border border-border bg-card px-4.5 pt-2.5 pb-[max(18px,env(safe-area-inset-bottom))] text-foreground transition-transform duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full motion-reduce:transition-none max-[359px]:px-3"
                dir="rtl"
              >
                <Drawer.Content>
                  <div
                    className="mx-auto mb-2.5 h-1 w-9 rounded-full bg-border"
                    aria-hidden="true"
                  />
                  <header className={headingClassName}>
                    <Drawer.Title className="text-heading-6">
                      {label}
                    </Drawer.Title>
                    {close}
                  </header>
                  {children(container)}
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      ) : (
        <Popover.Root open={open} onOpenChange={change}>
          {renderField(trigger)}
          <Popover.Portal container={container ?? undefined}>
            <Popover.Positioner
              positionMethod="fixed"
              side="bottom"
              align="start"
              sideOffset={10}
              collisionPadding={12}
              className="z-80 outline-none"
            >
              <Popover.Popup
                className="dorato-picker-popover max-h-[min(840px,var(--available-height))] w-[min(368px,calc(100vw_-_24px))] overflow-y-auto overscroll-contain rounded-[14px] border border-border bg-card p-3 text-foreground shadow-[0_8px_28px_rgb(35_31_94/12%)] outline-none"
                dir="rtl"
              >
                <header className={headingClassName}>
                  <Popover.Title className="text-heading-6">
                    {label}
                  </Popover.Title>
                  {close}
                </header>
                {children(container)}
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}
    </DirectionProvider>
  );
}

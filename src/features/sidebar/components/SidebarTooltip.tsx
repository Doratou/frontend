import type { ReactNode } from 'react';
import { Tooltip, type TooltipTriggerProps } from '@base-ui/react/tooltip';

interface SidebarTooltipProviderProps {
  children: ReactNode;
}

export function SidebarTooltipProvider({
  children,
}: SidebarTooltipProviderProps) {
  return (
    <Tooltip.Provider delay={80} closeDelay={0} timeout={400}>
      {children}
    </Tooltip.Provider>
  );
}

interface SidebarTooltipProps {
  label: string;
  disabled?: boolean;
  popupClassName: string;
  renderTrigger: TooltipTriggerProps['render'];
}

export function SidebarTooltip({
  label,
  disabled = false,
  popupClassName,
  renderTrigger,
}: SidebarTooltipProps) {
  return (
    <Tooltip.Root disabled={disabled}>
      <Tooltip.Trigger render={renderTrigger} />
      <Tooltip.Portal>
        <Tooltip.Positioner
          side="left"
          align="center"
          sideOffset={16}
          className="pointer-events-none z-50"
        >
          <Tooltip.Popup
            dir="rtl"
            className={`pointer-events-none origin-right rounded-full border px-3.5 py-2 font-['IRANYekan','Vazirmatn',Tahoma,sans-serif] text-[13px] leading-5 font-semibold tracking-normal whitespace-nowrap transition-[transform,opacity] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] select-none data-[ending-style]:translate-x-1 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:translate-x-2 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 motion-reduce:transition-none ${popupClassName}`}
          >
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

import { cn } from '@/lib/utils';
import { CHECKLIST_TABS } from '@/features/checklist/config';
import { formatNumber } from '@/utils/format';
import type { ChecklistTab } from '@/features/checklist/types';

interface ChecklistTabsProps {
  value: ChecklistTab;
  counts: Record<ChecklistTab, number>;
  onChange: (tab: ChecklistTab) => void;
  panelId: string;
}

export const checklistTabId = (tab: ChecklistTab) => `checklist-tab-${tab}`;

export function ChecklistTabs({
  value,
  counts,
  onChange,
  panelId,
}: ChecklistTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="فیلتر چک‌لیست"
      className="flex flex-wrap gap-1 rounded-xl border border-neutral-20 bg-neutral-10 p-1 dark:bg-transparent"
    >
      {CHECKLIST_TABS.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            id={checklistTabId(tab.value)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-caption font-bold whitespace-nowrap outline-hidden transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-60 motion-reduce:transition-none',
              isActive
                ? 'bg-secondary-70 text-white'
                : 'text-neutral-70 hover:bg-secondary-10 dark:hover:bg-secondary-80/40',
            )}
          >
            {tab.label} ({formatNumber(counts[tab.value])})
          </button>
        );
      })}
    </div>
  );
}

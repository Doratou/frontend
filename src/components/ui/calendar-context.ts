import { createContext } from 'react';
import type { HolidayItem } from '@/lib/holidays/holiday-service';

export const CalendarContext = createContext<{
  byDate: Map<string, HolidayItem[]>;
  container?: HTMLElement | null;
}>({ byDate: new Map() });

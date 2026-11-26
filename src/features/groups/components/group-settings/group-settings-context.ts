import { createContext, use } from 'react';
import type { GroupSettingsData } from '../../types';

export interface GroupSettingsContextValue {
  group: GroupSettingsData;
  isOwner: boolean;
  cover: { src?: string; onError: () => void };
  openInvite: () => void;
  close: () => void;
  exitGroup?: () => void;
}

export const GroupSettingsContext =
  createContext<GroupSettingsContextValue | null>(null);

export function useGroupSettingsContext(): GroupSettingsContextValue {
  const ctx = use(GroupSettingsContext);
  if (!ctx) {
    throw new Error(
      'useGroupSettingsContext must be used within GroupSettingsContext',
    );
  }
  return ctx;
}

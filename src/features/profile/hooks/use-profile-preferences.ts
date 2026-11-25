import { useState } from 'react';
import { toast } from '@/components/custom/toast';
import type { ProfilePreferences } from '../types';

export function useProfilePreferences() {
  // ponytail: client-only toggle until backend notification preferences endpoint exists.
  const [appNotifications, setAppNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(false);

  const preferences: ProfilePreferences = {
    appNotifications,
    telegramNotifications,
  };

  const handleChangePreference = <K extends keyof ProfilePreferences>(
    key: K,
    value: ProfilePreferences[K],
  ) => {
    if (key === 'appNotifications') {
      setAppNotifications(value);
    } else if (key === 'telegramNotifications') {
      setTelegramNotifications(value);
    }
  };

  const handleToggleTelegram = () => {
    // ponytail: backend has no telegram connect/disconnect endpoint in Bruno docs yet.
    toast.info('اتصال مستقیم ربات تلگرام به‌زودی فعال می‌شود.');
  };

  return {
    preferences,
    handleChangePreference,
    handleToggleTelegram,
  };
}

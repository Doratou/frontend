import type { GroupStatus } from './types';

export const GROUP_STATUS_LABELS: Readonly<Record<GroupStatus, string>> = {
  ACTIVE: 'فعال',
  SETTLING: 'در حال تسویه',
  CLOSED: 'آرشیو شده',
};

export const GROUP_TITLE_MAX_LENGTH = 150;
export const GROUP_DESCRIPTION_MAX_LENGTH = 5000;
export const GROUP_COVER_MAX_BYTES = 5 * 1024 * 1024;

export const INVITE_PASSWORD_MIN_BYTES = 8;
export const INVITE_PASSWORD_MAX_BYTES = 72;

export function getUtf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

const storageNumberFormatter = new Intl.NumberFormat('fa-IR', {
  maximumFractionDigits: 1,
});

export function formatGroupStorage(storage: {
  usedGb: number;
  totalGb: number;
}): { label: string; percent: number } {
  const usedFormatted = storageNumberFormatter.format(storage.usedGb);
  const totalFormatted = storageNumberFormatter.format(storage.totalGb);
  const ratio = Math.min(
    Math.max(storage.usedGb / (storage.totalGb || 1), 0),
    1,
  );
  return {
    label: `${usedFormatted} از ${totalFormatted} گیگابایت`,
    percent: Math.round(ratio * 100),
  };
}

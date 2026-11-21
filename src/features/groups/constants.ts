import type { GroupStatus } from './types';

export const GROUP_STATUS_LABELS: Readonly<Record<GroupStatus, string>> = {
  ACTIVE: 'فعال',
  SETTLING: 'آرشیوشده',
  CLOSED: 'بسته‌شده',
};

export const GROUP_TITLE_MAX_LENGTH = 150;
export const GROUP_DESCRIPTION_MAX_LENGTH = 5000;
export const GROUP_COVER_MAX_BYTES = 5 * 1024 * 1024;

export const INVITE_PASSWORD_MIN_BYTES = 8;
export const INVITE_PASSWORD_MAX_BYTES = 72;

export function getUtf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

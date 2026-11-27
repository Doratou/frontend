import { formatNumber } from '@/utils/format';

export const formatItemCount = (count: number) => `${formatNumber(count)} آیتم`;

export const formatMemberCount = (count: number) =>
  `${formatNumber(count)} عضو`;

export const formatPercent = (value: number) => `${formatNumber(value)}٪`;

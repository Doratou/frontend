type DateInput = Date | string | number;

export function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  }).format(date);
}

export function formatDateTime(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return formatDate(value, { hour: '2-digit', minute: '2-digit', ...options });
}

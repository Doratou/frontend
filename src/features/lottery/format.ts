const dateTimeFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatLotteryDate(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function toPersianNumber(value: number): string {
  return value.toLocaleString('fa-IR');
}

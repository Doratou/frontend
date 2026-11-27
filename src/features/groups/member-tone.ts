// Static class names so Tailwind can detect them. Keep in sync with the lottery palette.
const MEMBER_TONES = [
  'bg-primary-50',
  'bg-secondary-70',
  'bg-accent-60',
  'bg-danger-40',
  'bg-info-50',
] as const;

/**
 * A stable background color class for a person. The color depends only on the id,
 * never on list order, so the same person looks the same on every screen.
 */
export function getMemberTone(userId: string): string {
  let hash = 0;
  for (const char of userId) hash += char.codePointAt(0) ?? 0;
  return MEMBER_TONES[hash % MEMBER_TONES.length] ?? MEMBER_TONES[0];
}

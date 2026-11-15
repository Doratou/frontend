import { useParams } from 'react-router';

// The API needs the numeric group ID. Accepts a slug that is the ID ("12") or
// starts with it ("12-north-trip"); returns null when no ID can be read.
// TODO: align with the shared group id hook once the route slug is final.
export function useLotteryGroupId(): string | null {
  const { slug } = useParams();
  return slug?.match(/^\d+/)?.[0] ?? null;
}

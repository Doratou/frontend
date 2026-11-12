import { useParams } from 'react-router';

// TODO: match the real param name once the group route slug is final.
export function useLotteryGroupId(): string {
  const { slug } = useParams();
  return slug ?? 'demo-group';
}

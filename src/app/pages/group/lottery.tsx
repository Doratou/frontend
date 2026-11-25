import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { LotteryView } from '@/features/lottery/components/lottery-view';
import { useCurrentGroupId } from '@/features/poll/hooks/use-current-group-id';
import { useClosePoll } from '@/features/poll/hooks/use-manage-poll';
import { parsePollLotteryState } from '@/features/poll/to-lottery';

// Route modules loaded with `lazy` must export `Component`.
export function Component() {
  const groupId = useCurrentGroupId();
  const location = useLocation();
  const navigate = useNavigate();
  const closePoll = useClosePoll(groupId);
  // A poll can send its result here to become a lottery. The state is read once on
  // arrival and then cleared, so a page refresh does not reopen the create dialog.
  const [source] = useState(() => parsePollLotteryState(location.state));

  useEffect(() => {
    if (location.state !== null) {
      void navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  return (
    <LotteryView
      initialDraft={source?.draft ?? null}
      // The poll is closed only after its lottery exists, never before.
      onCreatedFromDraft={() => {
        if (source) closePoll.mutate(source.pollId);
      }}
    />
  );
}

import type { Dispatch, SetStateAction } from 'react';
import { useOutletContext } from 'react-router';
import type { OtpChallenge, ResetGrant } from '@/features/auth/api/contracts';
import type { AuthView } from '@/features/auth/config';

export interface AuthFlowContext {
  view: AuthView;
  identifier: string;
  setIdentifier: Dispatch<SetStateAction<string>>;
  challenge: OtpChallenge | null;
  setChallenge: Dispatch<SetStateAction<OtpChallenge | null>>;
  resetGrant: ResetGrant | null;
  setResetGrant: Dispatch<SetStateAction<ResetGrant | null>>;
}

export function useAuthFlow() {
  return useOutletContext<AuthFlowContext>();
}

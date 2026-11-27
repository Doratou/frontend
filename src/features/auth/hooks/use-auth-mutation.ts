import { useEffect, useRef } from 'react';
import { CanceledError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useIsPresent } from 'motion/react';
import { toast } from '@/components/custom/toast';
import { authErrorMessage } from '@/features/auth/api/auth-error';
import { authKeys } from '@/features/auth/api/query-keys';

export function useAuthMutation<TData, TVariables>(
  operation: (input: TVariables, signal: AbortSignal) => Promise<TData>,
) {
  const controller = useRef<AbortController | null>(null);
  const active = useRef(true);
  const present = useIsPresent();
  useEffect(() => {
    active.current = present;
    return () => {
      active.current = false;
      controller.current?.abort();
    };
  }, [present]);
  const mutation = useMutation({
    mutationKey: authKeys.all,
    mutationFn: async (input: TVariables) => {
      const signal = controller.current?.signal;
      if (!signal || signal.aborted) throw new CanceledError();
      const result = await operation(input, signal);
      if (signal.aborted) throw new CanceledError();
      return result;
    },
    onError: (error) => {
      if (!active.current || controller.current?.signal.aborted) return;
      const message = authErrorMessage(error);
      if (message) toast.error('درخواست انجام نشد', { description: message });
    },
    retry: false,
    gcTime: 0,
  });
  const mutateAsync: typeof mutation.mutateAsync = (...args) => {
    if (!active.current || controller.current)
      return Promise.reject(new CanceledError());
    // Lock before TanStack schedules the mutation so repeated submits keep its callbacks.
    const request = new AbortController();
    controller.current = request;
    return mutation.mutateAsync(...args).finally(() => {
      if (controller.current === request) controller.current = null;
    });
  };
  return {
    ...mutation,
    mutateAsync,
    mutate: (...args: Parameters<typeof mutation.mutate>) => {
      void mutateAsync(...args).catch(() => {});
    },
    reset: () => {
      if (!controller.current) mutation.reset();
    },
  };
}

import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useIsPresent } from 'motion/react';

export function useAuthMutation<TData, TVariables>(
  operation: (input: TVariables, signal: AbortSignal) => Promise<TData>,
) {
  const controller = useRef<AbortController | null>(null);
  const present = useIsPresent();
  useEffect(() => {
    if (!present) controller.current?.abort();
    return () => controller.current?.abort();
  }, [present]);
  return useMutation({
    mutationKey: ['auth'],
    mutationFn: (input: TVariables) => {
      controller.current?.abort();
      const request = new AbortController();
      controller.current = request;
      return operation(input, request.signal);
    },
    retry: false,
    gcTime: 0,
  });
}

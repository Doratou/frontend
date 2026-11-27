import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import {
  cloneGroup,
  createGroup,
  type CloneGroupInput,
  type CreateGroupInput,
} from '@/features/groups/api/create-group';
import { respondDirectInvite } from '@/features/groups/api/get-invitations';
import { groupKeys } from '@/features/groups/api/query-keys';
import { getApiErrorMessage } from '@/lib/api/error';

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGroupInput) => createGroup(input),
    onSuccess: (created) => {
      toast.success(`اکیپ «${created.title}» ساخته شد`);
      void queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
    onError: (error) => {
      toast.error('ساخت اکیپ انجام نشد', {
        description: getApiErrorMessage(error),
      });
    },
  });
}

export function useCloneGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CloneGroupInput) => cloneGroup(input),
    onSuccess: (cloned) => {
      toast.success(`اکیپ «${cloned.title}» ساخته شد`);
      void queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
    onError: (error) => {
      toast.error('ساخت اکیپ مشابه انجام نشد', {
        description: getApiErrorMessage(error),
      });
    },
  });
}

export function useRespondInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      inviteId,
      response,
    }: {
      inviteId: string;
      groupName: string;
      response: 'ACCEPTED' | 'REJECTED';
    }) => respondDirectInvite(inviteId, response),
    onSuccess: (_data, variables) => {
      if (variables.response === 'ACCEPTED') {
        toast.success(`به «${variables.groupName}» پیوستید`);
        void queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      } else {
        toast.info(`دعوت «${variables.groupName}» رد شد`);
      }
      void queryClient.invalidateQueries({ queryKey: groupKeys.invitations() });
    },
    onError: (error) => {
      toast.error('پاسخ به دعوت‌نامه انجام نشد', {
        description: getApiErrorMessage(error),
      });
    },
  });
}

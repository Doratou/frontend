import { useEffect, useMemo, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import axios from 'axios';
import { toast } from '@/components/custom/toast';
import { getApiErrorMessage } from '@/lib/api/error';
import { formatNumber } from '@/utils/format';
import { GroupError } from '../api/group-error';
import {
  archiveGroup,
  changeGroupInviteLinkPassword,
  createGroupInviteLink,
  deactivateGroupInviteLink,
  deleteGroup,
  downloadGroupAttachment,
  getFriendsList,
  getGroupInviteLinks,
  getGroupSettings,
  inviteGroupMembers,
  leaveGroup,
  removeGroupMember,
  transferGroupOwnership,
  updateGroupCover,
  updateGroupInfo,
  updateGroupInviteLinkInfo,
} from '../api/group-settings-api';
import { groupKeys } from '../api/query-keys';
import type { GroupInviteLink, GroupSettingsData } from '../types';

function showGroupError(error: unknown, fallback: string) {
  if (axios.isCancel(error)) return;
  toast.error(getApiErrorMessage(error, { fallback }));
}

function invalidateGroup(
  queryClient: QueryClient,
  groupId: string,
  options: { includeLists?: boolean } = {},
) {
  // groupKeys.detail(groupId) is the prefix for settings, members, and inviteLinks.
  void queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
  if (options.includeLists) {
    void queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
  }
}

function removeGroupFromCache(queryClient: QueryClient, groupId: string) {
  queryClient.removeQueries({ queryKey: groupKeys.detail(groupId) });
  void queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
}

export function useGroupSettings(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.settings(groupId),
    queryFn: ({ signal }) => getGroupSettings(groupId, signal),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useGroupInviteLinks(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupKeys.inviteLinks(groupId),
    queryFn: ({ signal }) => getGroupInviteLinks(groupId, signal),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useFriendsList(enabled = true) {
  return useQuery({
    queryKey: groupKeys.friends(),
    queryFn: ({ signal }) => getFriendsList(signal),
    enabled,
  });
}

export function useGroupCoverImage(
  group:
    Pick<GroupSettingsData, 'groupPhotoSrc' | 'coverAttachmentId'> | undefined,
) {
  const [fallbackFailedSrc, setFallbackFailedSrc] = useState<string | null>(
    null,
  );
  const attachmentId = group?.coverAttachmentId ?? '';

  const { data: blob } = useQuery({
    queryKey: groupKeys.coverBlob(attachmentId),
    queryFn: ({ signal }) => downloadGroupAttachment(attachmentId, signal),
    enabled: Boolean(attachmentId),
    staleTime: 30 * 60_000,
  });

  const blobUrl = useMemo(
    () => (blob ? URL.createObjectURL(blob) : undefined),
    [blob],
  );

  useEffect(() => {
    if (!blobUrl) return;
    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const fallbackUrl =
    group?.groupPhotoSrc && fallbackFailedSrc !== group.groupPhotoSrc
      ? group.groupPhotoSrc
      : undefined;

  const src = blobUrl ?? fallbackUrl;

  const onError = () => {
    if (!blobUrl && group?.groupPhotoSrc) {
      setFallbackFailedSrc(group.groupPhotoSrc);
    }
  };

  return { src, onError };
}

export function useUpdateGroupInfo(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title?: string; description?: string }) =>
      updateGroupInfo(groupId, data),
    onSuccess: () => {
      toast.success('مشخصات اکیپ با موفقیت ذخیره شد');
      invalidateGroup(queryClient, groupId, { includeLists: true });
    },
    onError: (error) => {
      showGroupError(error, 'خطا در ذخیره مشخصات اکیپ');
    },
  });
}

export function useUpdateGroupCover(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => updateGroupCover(groupId, file),
    onSuccess: (updated, file) => {
      if (updated.coverAttachmentId) {
        queryClient.setQueryData(
          groupKeys.coverBlob(updated.coverAttachmentId),
          file,
        );
      }
      queryClient.setQueryData<GroupSettingsData>(
        groupKeys.settings(groupId),
        (prev) =>
          prev
            ? {
                ...prev,
                coverAttachmentId: updated.coverAttachmentId,
                groupPhotoSrc: updated.groupPhotoSrc,
              }
            : prev,
      );
      toast.success('عکس اکیپ به‌روزرسانی شد');
      invalidateGroup(queryClient, groupId, { includeLists: true });
    },
    onError: (error) => {
      showGroupError(error, 'خطا در به‌روزرسانی عکس اکیپ');
    },
  });
}

export function useRemoveGroupMember(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeGroupMember(groupId, memberId),
    onSuccess: () => {
      toast.success('عضو با موفقیت از اکیپ حذف شد');
      invalidateGroup(queryClient, groupId);
    },
    onError: (error) => {
      showGroupError(error, 'خطا در حذف عضو');
    },
  });
}

export function useLeaveGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveGroup(groupId),
    onSuccess: () => {
      toast.success('با موفقیت از اکیپ خارج شدید');
      removeGroupFromCache(queryClient, groupId);
    },
    onError: (error) => {
      showGroupError(error, 'خطا در خروج از اکیپ');
    },
  });
}

export function useTransferGroupOwnership(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerUserId: string) =>
      transferGroupOwnership(groupId, newOwnerUserId),
    onSuccess: () => {
      toast.success('مالکیت اکیپ با موفقیت منتقل شد');
      invalidateGroup(queryClient, groupId);
    },
    onError: (error) => {
      showGroupError(error, 'خطا در انتقال مالکیت اکیپ');
    },
  });
}

export function useInviteGroupMembers(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => inviteGroupMembers(groupId, userIds),
    onSuccess: (result) => {
      if (result.succeededCount > 0 && result.failedItems.length === 0) {
        toast.success(
          `دعوتنامه برای ${formatNumber(result.succeededCount)} نفر ارسال شد`,
        );
      } else if (result.succeededCount > 0 && result.failedItems.length > 0) {
        toast.success(
          `دعوتنامه برای ${formatNumber(result.succeededCount)} نفر ارسال شد (${formatNumber(result.failedItems.length)} مورد ناموفق)`,
        );
      } else if (result.failedItems.length > 0) {
        toast.error(
          result.failedItems[0]?.message ?? 'ارسال دعوتنامه انجام نشد',
        );
      }
      invalidateGroup(queryClient, groupId);
    },
    onError: (error) => {
      showGroupError(error, 'خطا در ارسال دعوتنامه');
    },
  });
}

export interface SaveGroupInviteLinkInput {
  inviteId?: string;
  password?: string;
  maxUses?: number | null;
  expiryDate?: string | null;
}

type SaveInviteLinkOutcome =
  | { mode: 'created' }
  | { mode: 'updated'; infoUpdated: boolean; passwordUpdated: boolean };

export function useSaveGroupInviteLink(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: SaveGroupInviteLinkInput,
    ): Promise<SaveInviteLinkOutcome> => {
      if (!input.inviteId) {
        await createGroupInviteLink(groupId, {
          password: input.password ?? '',
          maxUses: input.maxUses,
          expiryDate: input.expiryDate,
        });
        return { mode: 'created' };
      }

      const hasInfo = input.maxUses != null || Boolean(input.expiryDate);
      const hasPassword = Boolean(input.password && input.password.length > 0);

      if (!hasInfo && !hasPassword) {
        throw new GroupError(
          'INVITE_NO_FIELDS_TO_UPDATE',
          'تغییر قابل ذخیره‌ای برای لینک انتخاب نشده است.',
          400,
        );
      }

      let infoUpdated = false;
      if (hasInfo) {
        await updateGroupInviteLinkInfo(groupId, input.inviteId, {
          maxUses: input.maxUses,
          expiryDate: input.expiryDate,
        });
        infoUpdated = true;
      }

      if (hasPassword && input.password) {
        try {
          await changeGroupInviteLinkPassword(
            groupId,
            input.inviteId,
            input.password,
          );
        } catch (error) {
          if (infoUpdated) {
            throw new GroupError(
              'INVITE_PARTIAL_UPDATE',
              `تنظیمات لینک ذخیره شد، اما تغییر رمز انجام نشد: ${getApiErrorMessage(error, { fallback: 'خطا در تغییر رمز عبور' })}`,
              error instanceof GroupError ? error.status : undefined,
              error,
            );
          }
          throw error;
        }
      }

      return {
        mode: 'updated',
        infoUpdated,
        passwordUpdated: hasPassword,
      };
    },
    onSuccess: (outcome) => {
      if (outcome.mode === 'created') {
        toast.success('لینک دعوت با موفقیت ساخته شد');
      } else if (outcome.infoUpdated && outcome.passwordUpdated) {
        toast.success('تنظیمات لینک و رمز به‌روزرسانی شد');
      } else if (outcome.passwordUpdated) {
        toast.success('رمز عبور لینک دعوت به‌روزرسانی شد');
      } else {
        toast.success('تنظیمات لینک دعوت به‌روزرسانی شد');
      }
    },
    onError: (error) => {
      showGroupError(error, 'خطا در ذخیره تنظیمات لینک دعوت');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.inviteLinks(groupId),
      });
    },
  });
}

export function useDeactivateGroupInviteLink(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      deactivateGroupInviteLink(groupId, inviteId),
    onSuccess: (_, inviteId) => {
      queryClient.setQueryData<GroupInviteLink[]>(
        groupKeys.inviteLinks(groupId),
        (prev) => prev?.filter((link) => link.id !== inviteId),
      );
      toast.success('لینک دعوت با موفقیت غیرفعال شد');
      void queryClient.invalidateQueries({
        queryKey: groupKeys.inviteLinks(groupId),
      });
    },
    onError: (error) => {
      showGroupError(error, 'خطا در غیرفعال کردن لینک دعوت');
    },
  });
}

export function useArchiveGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => archiveGroup(groupId),
    onSuccess: () => {
      toast.success('اکیپ با موفقیت آرشیو شد');
      invalidateGroup(queryClient, groupId, { includeLists: true });
    },
    onError: (error) => {
      showGroupError(error, 'خطا در آرشیو کردن اکیپ');
    },
  });
}

export function useDeleteGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteGroup(groupId),
    onSuccess: () => {
      toast.success('اکیپ با موفقیت حذف شد');
      removeGroupFromCache(queryClient, groupId);
    },
    onError: (error) => {
      showGroupError(error, 'خطا در حذف اکیپ');
    },
  });
}

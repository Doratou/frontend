import { useEffect, useMemo, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import { formatNumber } from '@/utils/format';
import {
  getGroupErrorMessage,
  GroupError,
  isCanceledError,
} from '../api/group-error';
import {
  archiveGroup,
  changeGroupInviteLinkPassword,
  createGroupInviteLink,
  deactivateGroupInviteLink,
  deleteGroup,
  friendsListQueryOptions,
  groupCoverBlobQueryOptions,
  groupInviteLinksQueryOptions,
  groupSettingsQueryOptions,
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
  if (isCanceledError(error)) return;
  toast.error(getGroupErrorMessage(error, fallback));
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
  return useQuery(groupSettingsQueryOptions(groupId, enabled));
}

export function useGroupInviteLinks(groupId: string, enabled = true) {
  return useQuery(groupInviteLinksQueryOptions(groupId, enabled));
}

export function useFriendsList(enabled = true) {
  return useQuery(friendsListQueryOptions(enabled));
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

export function useGroupCoverImage(
  group:
    Pick<GroupSettingsData, 'groupPhotoSrc' | 'coverAttachmentId'> | undefined,
) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const directUrl = group?.groupPhotoSrc;
  const directFailed = Boolean(directUrl && failedSrc === directUrl);
  const shouldFetchBlob = Boolean(
    group?.coverAttachmentId && (!directUrl || directFailed),
  );

  const { data: blob } = useQuery(
    groupCoverBlobQueryOptions(group?.coverAttachmentId, shouldFetchBlob),
  );

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

  const src =
    blobUrl && failedSrc !== blobUrl
      ? blobUrl
      : directUrl && !directFailed
        ? directUrl
        : undefined;

  const onError = () => {
    if (src) setFailedSrc(src);
  };

  return { src, onError };
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
  maxUsesChanged?: boolean;
  expiryDateChanged?: boolean;
}

export function useSaveGroupInviteLink(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveGroupInviteLinkInput) => {
      if (!input.inviteId) {
        await createGroupInviteLink(groupId, {
          password: input.password ?? '',
          maxUses: input.maxUses,
          expiryDate: input.expiryDate,
        });
        return 'created' as const;
      }

      const nextInfo: { maxUses?: number; expiryDate?: string } = {};
      if (input.maxUsesChanged && input.maxUses != null) {
        nextInfo.maxUses = input.maxUses;
      }
      if (input.expiryDateChanged && input.expiryDate) {
        nextInfo.expiryDate = input.expiryDate;
      }

      const tasks: Promise<unknown>[] = [];
      if (nextInfo.maxUses !== undefined || nextInfo.expiryDate !== undefined) {
        tasks.push(
          updateGroupInviteLinkInfo(groupId, input.inviteId, nextInfo),
        );
      }
      if (input.password && input.password.length > 0) {
        tasks.push(
          changeGroupInviteLinkPassword(
            groupId,
            input.inviteId,
            input.password,
          ),
        );
      }

      if (tasks.length === 0) {
        throw new GroupError(
          'INVITE_NO_FIELDS_TO_UPDATE',
          'تغییر قابل ذخیره‌ای برای لینک انتخاب نشده است.',
          400,
        );
      }

      await Promise.all(tasks);
      return 'updated' as const;
    },
    onSuccess: (mode) => {
      toast.success(
        mode === 'created'
          ? 'لینک دعوت با موفقیت ساخته شد'
          : 'تنظیمات لینک و رمز به‌روزرسانی شد',
      );
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

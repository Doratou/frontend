import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/custom/toast';
import {
  archiveGroup,
  deleteGroup,
  getFriendsList,
  getGroupSettings,
  inviteGroupMembers,
  removeGroupMember,
  updateGroupInfo,
  updateGroupLink,
  updateGroupPhoto,
} from '../api/group-settings-api';
import { groupKeys } from '../api/query-keys';

export function useGroupSettings(groupId: string) {
  return useQuery({
    queryKey: groupKeys.settings(groupId),
    queryFn: () => getGroupSettings(groupId),
  });
}

export function useUpdateGroupInfo(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description: string }) =>
      updateGroupInfo(groupId, data),
    onSuccess: () => {
      toast.success('مشخصات اکیپ با موفقیت ذخیره شد');
      void queryClient.invalidateQueries({ queryKey: groupKeys.settings(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
    onError: () => {
      toast.error('خطا در ذخیره مشخصات اکیپ');
    },
  });
}

export function useRemoveGroupMember(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeGroupMember(groupId, memberId),
    onSuccess: () => {
      toast.success('عضو با موفقیت از اکیپ حذف شد');
      void queryClient.invalidateQueries({ queryKey: groupKeys.settings(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
    },
    onError: () => {
      toast.error('خطا در حذف عضو');
    },
  });
}

export function useInviteGroupMembers(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendIds: string[]) => inviteGroupMembers(groupId, friendIds),
    onSuccess: (_, friendIds) => {
      toast.success(`${friendIds.length} نفر به اکیپ اضافه شدند`);
      void queryClient.invalidateQueries({ queryKey: groupKeys.settings(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
    },
    onError: () => {
      toast.error('خطا در افزودن اعضا');
    },
  });
}

export function useUpdateGroupPhoto(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoSrc: string) => updateGroupPhoto(groupId, photoSrc),
    onSuccess: () => {
      toast.success('عکس اکیپ به‌روزرسانی شد');
      void queryClient.invalidateQueries({ queryKey: groupKeys.settings(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
    onError: () => {
      toast.error('خطا در به‌روزرسانی عکس اکیپ');
    },
  });
}

export function useUpdateGroupLink(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      password?: string;
      maxUses?: number | null;
      expiryDate?: string | null;
    }) => updateGroupLink(groupId, data),
    onSuccess: () => {
      toast.success('تنظیمات لینک و رمز به‌روزرسانی شد');
      void queryClient.invalidateQueries({ queryKey: groupKeys.settings(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
    onError: () => {
      toast.error('خطا در به‌روزرسانی تنظیمات لینک');
    },
  });
}

export function useArchiveGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (archive: boolean) => archiveGroup(groupId, archive),
    onSuccess: (_, archive) => {
      toast.success(archive ? 'اکیپ آرشیو شد' : 'اکیپ از آرشیو بازگردانده شد');
      void queryClient.invalidateQueries({ queryKey: groupKeys.settings(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
    onError: () => {
      toast.error('خطا در تغییر وضعیت آرشیو');
    },
  });
}

export function useDeleteGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteGroup(groupId),
    onSuccess: () => {
      toast.success('اکیپ با موفقیت حذف شد');
      void queryClient.invalidateQueries({ queryKey: groupKeys.settings(groupId) });
      void queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    },
    onError: () => {
      toast.error('خطا در حذف اکیپ');
    },
  });
}

export function useFriendsList() {
  return useQuery({
    queryKey: groupKeys.friends(),
    queryFn: getFriendsList,
  });
}

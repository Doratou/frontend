import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/error';
import type { UserProfile } from '../types';
import {
  deleteAccountDtoSchema,
  mapUserDtoToProfile,
  profileEnvelopeSchema,
  profileUserDtoSchema,
  walletDtoSchema,
} from './contracts';
import { profileKeys } from './query-keys';

function parseEnvelopeData<T>(payload: unknown, schema: z.ZodType<T>): T {
  const envelope = profileEnvelopeSchema.safeParse(payload);
  if (!envelope.success) {
    throw new ApiError('پاسخ سرور معتبر نیست. دوباره تلاش کنید.');
  }
  const parsed = schema.safeParse(envelope.data.data);
  if (!parsed.success) {
    throw new ApiError('ساختار اطلاعات دریافتی از سرور معتبر نیست.');
  }
  return parsed.data;
}

export async function getMyProfile(signal?: AbortSignal): Promise<UserProfile> {
  const response = await apiClient.get<unknown>('/users/me', { signal });
  return mapUserDtoToProfile(
    parseEnvelopeData(response.data, profileUserDtoSchema),
  );
}

export async function getMyWallet(signal?: AbortSignal): Promise<number> {
  const response = await apiClient.get<unknown>('/users/me/wallet', { signal });
  return parseEnvelopeData(response.data, walletDtoSchema).wallet;
}

export async function updateProfileName(
  input: { name: string },
  signal?: AbortSignal,
): Promise<UserProfile> {
  const response = await apiClient.patch<unknown>('/users/me', input, {
    signal,
  });
  return mapUserDtoToProfile(
    parseEnvelopeData(response.data, profileUserDtoSchema),
  );
}

export async function updateProfileEmail(
  input: { email: string },
  signal?: AbortSignal,
): Promise<UserProfile> {
  const response = await apiClient.patch<unknown>('/users/me/email', input, {
    signal,
  });
  return mapUserDtoToProfile(
    parseEnvelopeData(response.data, profileUserDtoSchema),
  );
}

export async function updateProfilePhone(
  input: { phone: string },
  signal?: AbortSignal,
): Promise<UserProfile> {
  const response = await apiClient.patch<unknown>('/users/me/phone', input, {
    signal,
  });
  return mapUserDtoToProfile(
    parseEnvelopeData(response.data, profileUserDtoSchema),
  );
}

export async function regenerateFriendCode(
  signal?: AbortSignal,
): Promise<UserProfile> {
  const response = await apiClient.post<unknown>(
    '/users/me/friend-code/regenerate',
    undefined,
    { signal },
  );
  return mapUserDtoToProfile(
    parseEnvelopeData(response.data, profileUserDtoSchema),
  );
}

export async function updateProfileAvatar(
  input: { avatarAttachmentId: number },
  signal?: AbortSignal,
): Promise<UserProfile> {
  const response = await apiClient.patch<unknown>(
    '/auth/me/avatar',
    { avatar_attachment_id: input.avatarAttachmentId },
    { signal },
  );
  return mapUserDtoToProfile(
    parseEnvelopeData(response.data, profileUserDtoSchema),
  );
}

export async function deleteMyAccount(signal?: AbortSignal): Promise<void> {
  const response = await apiClient.delete<unknown>('/users/me', { signal });
  parseEnvelopeData(response.data, deleteAccountDtoSchema);
}

export function useMyProfileQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: ({ signal }) => getMyProfile(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useUpdateProfileNameMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string }) => updateProfileName(input),
    onSuccess: (next) => {
      queryClient.setQueryData(profileKeys.me(), next);
    },
  });
}

export function useUpdateProfileEmailMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string }) => updateProfileEmail(input),
    onSuccess: (next) => {
      queryClient.setQueryData(profileKeys.me(), next);
    },
  });
}

export function useUpdateProfilePhoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { phone: string }) => updateProfilePhone(input),
    onSuccess: (next) => {
      queryClient.setQueryData(profileKeys.me(), next);
    },
  });
}

export function useRegenerateFriendCodeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => regenerateFriendCode(),
    onSuccess: (next) => {
      queryClient.setQueryData(profileKeys.me(), next);
    },
  });
}

export function useUpdateProfileAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { avatarAttachmentId: number }) =>
      updateProfileAvatar(input),
    onSuccess: (next) => {
      queryClient.setQueryData(profileKeys.me(), next);
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteMyAccount(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: profileKeys.all });
    },
  });
}

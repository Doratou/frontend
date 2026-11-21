import { z } from 'zod';
import type { UserProfile } from '../types';

export const profileEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

export const profileUserDtoSchema = z.object({
  id: z.union([z.number().int().positive(), z.string().min(1)]),
  name: z.string().nullable().optional(),
  friend_code: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  is_email_verified: z.boolean().optional(),
  is_phone_verified: z.boolean().optional(),
  avatar_attachment_id: z.union([z.number(), z.string()]).nullable().optional(),
  system_role: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(['USER', 'ADMIN'])),
  status: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(['ACTIVE', 'INACTIVE']))
    .optional(),
  wallet: z.number().optional(),
  telegram_chat_id: z.union([z.number(), z.string()]).nullable().optional(),
  telegram_user_id: z.union([z.number(), z.string()]).nullable().optional(),
  created_at: z.string().optional(),
});

export type ProfileUserDto = z.infer<typeof profileUserDtoSchema>;

export const walletDtoSchema = z.object({
  wallet: z.number(),
});

export const deleteAccountDtoSchema = z.object({
  message: z.string().optional(),
});

export function mapUserDtoToProfile(dto: ProfileUserDto): UserProfile {
  const email = dto.email?.trim() || null;
  const phone = dto.phone?.trim() || null;
  const name = dto.name?.trim() || '';

  return {
    id: String(dto.id),
    displayName: name,
    role: dto.system_role,
    status: dto.status ?? 'ACTIVE',
    joinedAt: dto.created_at ?? '',
    avatarAttachmentId: dto.avatar_attachment_id ?? null,
    friendCode: dto.friend_code?.trim() || '',
    walletBalance: typeof dto.wallet === 'number' ? dto.wallet : 0,
    email,
    phone,
    isEmailVerified: Boolean(dto.is_email_verified),
    isPhoneVerified: Boolean(dto.is_phone_verified),
    isTelegramConnected: Boolean(dto.telegram_chat_id || dto.telegram_user_id),
  };
}

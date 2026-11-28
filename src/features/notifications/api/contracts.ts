import { z } from 'zod';
import { formatNumber } from '@/utils/format';
import type {
  MarkReadResult,
  NotificationCategory,
  NotificationInviter,
  NotificationItem,
  NotificationsPageResult,
  SyncNotificationsResult,
  UnreadCountResult,
} from '../types';

export const rawNotificationDtoSchema = z.object({
  id: z.number().int().positive(),
  recipient_id: z.number().int().positive().optional(),
  actor_id: z.number().int().nonnegative().nullable().optional(),
  group_id: z.number().int().positive().nullable().optional(),
  event: z.string().min(1),
  data: z.record(z.string(), z.unknown()).nullable().optional(),
  is_read: z.boolean(),
  created_at: z.string(),
});

export type RawNotificationDto = z.infer<typeof rawNotificationDtoSchema>;

export const notificationsListDtoSchema = z.object({
  items: z.array(rawNotificationDtoSchema).default([]),
  unread_count: z.number().int().nonnegative().default(0),
  next_cursor: z.number().int().nonnegative().nullable().optional(),
  has_more: z.boolean().default(false),
});

export const unreadCountDtoSchema = z.object({
  unread_count: z.number().int().nonnegative(),
  last_read_id: z.number().int().nonnegative().default(0),
});

export const syncNotificationsDtoSchema = z.object({
  items: z.array(rawNotificationDtoSchema).default([]),
  latest_id: z.number().int().nonnegative().default(0),
  has_more: z.boolean().default(false),
});

export const markReadDtoSchema = z.object({
  last_read_id: z.number().int().nonnegative().default(0),
  unread_count: z.number().int().nonnegative().default(0),
});

export const deleteNotificationDtoSchema = z.object({
  deleted: z.boolean(),
});

export const wsEnvelopeSchema = z.object({
  id: z.string().optional(),
  event: z.string().min(1),
  channel: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().optional(),
});

export type WsEnvelope = z.infer<typeof wsEnvelopeSchema>;

function readString(
  data: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = data[key];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readPositiveId(
  data: Record<string, unknown>,
  key: string,
): string | null {
  const value = data[key];
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return String(value);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return String(parsed);
  }
  return null;
}

function readNumber(
  data: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = data[key];
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function makeInviter(
  name: string | undefined,
  avatarAttachmentId: string | null,
): NotificationInviter | undefined {
  if (!name) return undefined;
  return {
    name,
    avatarAttachmentId,
  };
}

interface MappedEventContent {
  category: NotificationCategory;
  title: string;
  description: string;
  groupName: string;
  inviter?: NotificationInviter;
}

function mapEventContent(
  dto: RawNotificationDto,
  data: Record<string, unknown>,
): MappedEventContent {
  const groupName = readString(data, 'group_name') ?? '';

  switch (dto.event) {
    case 'group.invite_received': {
      const senderName = readString(data, 'sender_name') ?? 'کاربر دوراتو';
      const senderAvatarId = readPositiveId(data, 'sender_avatar_id');
      const targetGroup = groupName || 'یک اکیپ';
      return {
        category: 'join_request',
        title: `دعوت به اکیپ ${targetGroup}`,
        description: `${senderName} شما را به اکیپ «${targetGroup}» دعوت کرده است.`,
        groupName,
        inviter: makeInviter(senderName, senderAvatarId),
      };
    }

    case 'friend_request.received': {
      const senderName = readString(data, 'sender_name') ?? 'کاربر دوراتو';
      const senderAvatarId = readPositiveId(data, 'sender_avatar_id');
      return {
        category: 'friend_request',
        title: `درخواست دوستی از ${senderName}`,
        description: `${senderName} برای شما درخواست دوستی ارسال کرده است.`,
        groupName: '',
        inviter: makeInviter(senderName, senderAvatarId),
      };
    }

    case 'friend_request.responded': {
      const responderName =
        readString(data, 'responder_name') ?? 'کاربر دوراتو';
      const responderAvatarId = readPositiveId(data, 'responder_avatar_id');
      const status = readString(data, 'status')?.toLowerCase();
      const accepted = status === 'accepted';
      return {
        category: 'friend_request',
        title: accepted
          ? `${responderName} درخواست دوستی را پذیرفت`
          : `${responderName} درخواست دوستی را رد کرد`,
        description: accepted
          ? `اکنون شما و ${responderName} در فهرست دوستان هم هستید.`
          : `درخواست دوستی شما از طرف ${responderName} رد شد.`,
        groupName: '',
        inviter: makeInviter(responderName, responderAvatarId),
      };
    }

    case 'settlement.paid': {
      const debtorName = readString(data, 'debtor_name') ?? 'یکی از اعضا';
      const amount = readNumber(data, 'amount_toman');
      const amountText =
        amount !== undefined ? `${formatNumber(amount)} تومان` : 'مبلغی';
      return {
        category: 'wallet',
        title: `تسویه جدید از ${debtorName}`,
        description: groupName
          ? `${debtorName} مبلغ ${amountText} در اکیپ «${groupName}» پرداخت کرد.`
          : `${debtorName} مبلغ ${amountText} پرداخت کرد.`,
        groupName,
      };
    }

    case 'poll.created': {
      const creatorName = readString(data, 'creator_name');
      const question =
        readString(data, 'question') ?? readString(data, 'title');
      return {
        category: 'poll',
        title: question ? `نظرسنجی جدید: ${question}` : 'نظرسنجی جدید ثبت شد',
        description: creatorName
          ? `${creatorName} در اکیپ «${groupName || 'اکیپ'}» یک نظرسنجی جدید ساخت.`
          : question
            ? `نظرسنجی «${question}» برای رأی‌گیری آماده است.`
            : 'یک نظرسنجی جدید در اکیپ ایجاد شد.',
        groupName,
      };
    }

    case 'poll.closed': {
      const question =
        readString(data, 'question') ?? readString(data, 'title');
      const totalVotes = readNumber(data, 'total_votes');
      const winners = Array.isArray(data.winning_option)
        ? data.winning_option
            .map((item) =>
              typeof item === 'object' && item !== null
                ? readString(item as Record<string, unknown>, 'text')
                : undefined,
            )
            .filter((text): text is string => Boolean(text))
        : [];
      const winnerSummary =
        winners.length > 0 ? ` گزینه برنده: «${winners.join('، ')}».` : '';
      const votesSummary =
        totalVotes !== undefined ? ` (${formatNumber(totalVotes)} رأی)` : '';
      return {
        category: 'poll',
        title: question
          ? `پایان نظرسنجی: ${question}`
          : 'نتیجه نظرسنجی مشخص شد',
        description: `نظرسنجی به پایان رسید${votesSummary}.${winnerSummary}`,
        groupName,
      };
    }

    case 'draw.created': {
      const creatorName = readString(data, 'creator_name');
      const title = readString(data, 'title');
      return {
        category: 'lottery',
        title: title ? `قرعه‌کشی جدید: ${title}` : 'قرعه‌کشی جدید ساخته شد',
        description: creatorName
          ? `${creatorName} یک قرعه‌کشی جدید در اکیپ «${groupName || 'اکیپ'}» ایجاد کرد.`
          : 'یک قرعه‌کشی جدید در اکیپ ایجاد شده است.',
        groupName,
      };
    }

    case 'draw.result': {
      const title = readString(data, 'title');
      const winnerName = readString(data, 'winner_name');
      return {
        category: 'lottery',
        title: title ? `نتیجه قرعه‌کشی «${title}»` : 'نتیجه قرعه‌کشی اعلام شد',
        description: winnerName
          ? `برنده قرعه‌کشی: ${winnerName}`
          : 'قرعه‌کشی انجام شد و نتیجه آن ثبت گردید.',
        groupName,
      };
    }

    case 'checklist.updated': {
      const updatedBy = readString(data, 'updated_by_name') ?? 'یکی از اعضا';
      return {
        category: 'checklist',
        title: 'به‌روزرسانی چک‌لیست اکیپ',
        description: groupName
          ? `${updatedBy} چک‌لیست اکیپ «${groupName}» را به‌روزرسانی کرد.`
          : `${updatedBy} چک‌لیست اکیپ را به‌روزرسانی کرد.`,
        groupName,
      };
    }

    case 'admin_report.answered': {
      const subject = readString(data, 'subject');
      const answer = readString(data, 'answer');
      return {
        category: 'announcement',
        title: subject ? `پاسخ پشتیبانی: ${subject}` : 'پاسخ جدید به گزارش شما',
        description: answer ?? 'پاسخ تیم پشتیبانی برای گزارش شما ثبت شده است.',
        groupName: '',
      };
    }

    case 'group.member_joined': {
      const userName = readString(data, 'user_name') ?? 'عضو جدید';
      return {
        category: 'announcement',
        title: `${userName} به اکیپ پیوست`,
        description: groupName
          ? `${userName} عضو اکیپ «${groupName}» شد.`
          : `${userName} به اکیپ ملحق شد.`,
        groupName,
      };
    }

    case 'group.member_left': {
      const userName = readString(data, 'user_name') ?? 'یکی از اعضا';
      const reason = readString(data, 'reason');
      const isKicked = reason === 'kicked';
      return {
        category: 'announcement',
        title: isKicked
          ? `${userName} از اکیپ حذف شد`
          : `${userName} از اکیپ خارج شد`,
        description: groupName
          ? isKicked
            ? `${userName} از اکیپ «${groupName}» حذف شد.`
            : `${userName} اکیپ «${groupName}» را ترک کرد.`
          : isKicked
            ? `${userName} از اکیپ حذف شد.`
            : `${userName} اکیپ را ترک کرد.`,
        groupName,
      };
    }

    case 'group.announcement': {
      const title = readString(data, 'title') ?? 'اطلاعیه جدید اکیپ';
      const message =
        readString(data, 'message') ?? 'اطلاعیه جدیدی در اکیپ ثبت شده است.';
      return {
        category: 'announcement',
        title,
        description: message,
        groupName,
      };
    }

    default: {
      const title =
        readString(data, 'title') ??
        readString(data, 'subject') ??
        'اعلان جدید';
      const description =
        readString(data, 'message') ??
        readString(data, 'description') ??
        'یک رویداد جدید برای حساب شما ثبت شده است.';
      return {
        category: 'announcement',
        title,
        description,
        groupName,
      };
    }
  }
}

export function mapNotificationDto(dto: RawNotificationDto): NotificationItem {
  const data = dto.data ?? {};
  const mapped = mapEventContent(dto, data);
  const groupId =
    dto.group_id != null
      ? String(dto.group_id)
      : readPositiveId(data, 'group_id');

  return {
    id: String(dto.id),
    numericId: dto.id,
    event: dto.event,
    category: mapped.category,
    title: mapped.title,
    description: mapped.description,
    groupId,
    groupName: mapped.groupName,
    createdAt: dto.created_at,
    unread: !dto.is_read,
    inviter: mapped.inviter,
  };
}

export function mapNotificationsListDto(
  dto: z.infer<typeof notificationsListDtoSchema>,
): NotificationsPageResult {
  return {
    items: dto.items.map(mapNotificationDto),
    unreadCount: dto.unread_count,
    nextCursor:
      dto.next_cursor != null && dto.next_cursor > 0 ? dto.next_cursor : null,
    hasMore: dto.has_more,
  };
}

export function mapUnreadCountDto(
  dto: z.infer<typeof unreadCountDtoSchema>,
): UnreadCountResult {
  return {
    unreadCount: dto.unread_count,
    lastReadId: dto.last_read_id,
  };
}

export function mapSyncNotificationsDto(
  dto: z.infer<typeof syncNotificationsDtoSchema>,
): SyncNotificationsResult {
  return {
    items: dto.items.map(mapNotificationDto),
    latestId: dto.latest_id,
    hasMore: dto.has_more,
  };
}

export function mapMarkReadDto(
  dto: z.infer<typeof markReadDtoSchema>,
): MarkReadResult {
  return {
    lastReadId: dto.last_read_id,
    unreadCount: dto.unread_count,
  };
}

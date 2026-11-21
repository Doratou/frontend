import { useEffect, useRef, useState } from 'react';
import {
  Archive,
  Camera,
  Check,
  Copy,
  Crown,
  Info,
  Link as LinkIcon,
  LogOut,
  Save,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { LoadingButton } from '@/components/custom/loading-button';
import { NumberField } from '@/components/custom/number-field';
import { PasswordField } from '@/components/custom/password-field';
import { PersianDatePicker } from '@/components/custom/persian-picker';
import { TextField } from '@/components/custom/text-field';
import { toast } from '@/components/custom/toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { dateToApi, inIran } from '@/lib/persian-date';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import settingsNavBg from '@/assets/group/settings-nav-bg.svg';
import { getGroupErrorMessage } from '../api/group-error';
import {
  getUtf8ByteLength,
  GROUP_COVER_MAX_BYTES,
  GROUP_DESCRIPTION_MAX_LENGTH,
  GROUP_STATUS_LABELS,
  GROUP_TITLE_MAX_LENGTH,
  INVITE_PASSWORD_MAX_BYTES,
  INVITE_PASSWORD_MIN_BYTES,
} from '../constants';
import {
  useArchiveGroup,
  useDeactivateGroupInviteLink,
  useDeleteGroup,
  useGroupCoverImage,
  useGroupInviteLinks,
  useGroupSettings,
  useLeaveGroup,
  useRemoveGroupMember,
  useSaveGroupInviteLink,
  useTransferGroupOwnership,
  useUpdateGroupCover,
  useUpdateGroupInfo,
} from '../hooks/use-group-settings';
import type { GroupInviteLink, GroupSettingsData, GroupStatus } from '../types';
import { InviteMemberDialog } from './InviteMemberDialog';
import { MemberAvatar } from './MemberAvatar';

interface GroupSettingsDialogProps {
  groupId: string;
  currentUserId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupExit?: () => void;
}

type SettingsSection = 'overview' | 'members' | 'link' | 'archive';

const SECTION_ICONS: Record<SettingsSection, typeof Users> = {
  overview: Info,
  members: Users,
  link: LinkIcon,
  archive: Archive,
};

function StatusChip({ status }: { status: GroupStatus }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-bold shadow-2xs ring-1',
        !isActive
          ? 'bg-white/70 text-neutral-60 ring-neutral-30/60'
          : 'bg-white/70 text-secondary-80 ring-secondary-30/60',
      )}
    >
      <span className="relative flex size-2">
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary-60 opacity-60 motion-reduce:hidden"
          />
        )}
        <span
          className={cn(
            'relative inline-flex size-2 rounded-full',
            isActive ? 'bg-secondary-60' : 'bg-neutral-40',
          )}
        />
      </span>
      {GROUP_STATUS_LABELS[status]}
    </span>
  );
}

function GroupAvatar({
  group,
  className,
}: {
  group: GroupSettingsData;
  className?: string;
}) {
  const { src, onError } = useGroupCoverImage(group);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoaded = Boolean(src && loadedSrc === src);

  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-[18px] border border-neutral-30/80 bg-white text-secondary-70 shadow-xs',
        className,
      )}
    >
      <span aria-hidden="true" className="font-black">
        {group.title.charAt(0)}
      </span>
      {src && (
        <img
          src={src}
          alt=""
          onLoad={() => setLoadedSrc(src)}
          onError={onError}
          draggable={false}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
            isLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  );
}

interface InlineConfirmProps {
  prompt: string;
  confirmLabel: string;
  loadingLabel: string;
  cancelAriaLabel: string;
  isLoading: boolean;
  tone?: 'danger' | 'accent';
  compact?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function InlineConfirm({
  prompt,
  confirmLabel,
  loadingLabel,
  cancelAriaLabel,
  isLoading,
  tone = 'danger',
  compact = false,
  onConfirm,
  onCancel,
}: InlineConfirmProps) {
  const isAccent = tone === 'accent';
  return (
    <div
      className={cn(
        'flex animate-in items-center gap-2 text-xs font-bold duration-150 fade-in slide-in-from-right-2',
        isAccent ? 'text-accent-80' : 'text-danger-50',
        !compact && 'rounded-xl bg-white p-2 shadow-xs',
      )}
    >
      <span>{prompt}</span>
      <LoadingButton
        type="button"
        size="md"
        radius="lg"
        isLoading={isLoading}
        loadingText={loadingLabel}
        onClick={onConfirm}
        className={cn(
          'text-white',
          compact && 'h-7 px-2.5 text-xs',
          isAccent
            ? 'bg-accent-60 hover:bg-accent-70 active:bg-accent-80'
            : 'bg-danger-40 hover:bg-danger-50 active:bg-danger-60',
        )}
      >
        {confirmLabel}
      </LoadingButton>
      <button
        type="button"
        onClick={onCancel}
        aria-label={cancelAriaLabel}
        className="hover:text-neutral-90 grid size-7 cursor-pointer place-items-center rounded-md text-neutral-60 hover:bg-neutral-20/70"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

interface NavItemProps {
  label: string;
  icon: typeof Users;
  active: boolean;
  danger?: boolean;
  count?: number;
  onClick: () => void;
}

function NavItem({
  label,
  icon: Icon,
  active,
  danger = false,
  count,
  onClick,
}: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active || undefined}
      className={cn(
        'group relative flex h-11 w-full cursor-pointer items-center overflow-hidden rounded-2xl border-[1.5px] transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-60 motion-reduce:transition-none',
        danger
          ? active
            ? 'border-danger-50 bg-danger-20/75 shadow-xs'
            : 'border-danger-40 bg-danger-10 hover:border-danger-50 hover:bg-danger-20/55'
          : active
            ? 'border-transparent bg-secondary-20'
            : 'border-transparent bg-transparent hover:bg-secondary-20/50',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'w-0.9 absolute top-1/2 right-0.5 h-5.5 -translate-y-1/2 rounded-xs bg-secondary-60 transition-opacity duration-200 motion-reduce:transition-none',
          active && !danger ? 'opacity-100' : 'opacity-0',
        )}
      />

      <span className="flex h-full w-10.25 shrink-0 items-center justify-center">
        <Icon
          className={cn(
            'pointer-events-none h-4.5 w-4.5 shrink-0 transition-transform duration-150 motion-reduce:transition-none',
            danger ? 'text-danger-50' : 'text-primary-80',
          )}
          strokeWidth={1.75}
        />
      </span>

      <span
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 pl-3 text-sm leading-5.5 font-medium',
          danger ? 'text-danger-50' : 'text-primary-80',
        )}
      >
        <span className="min-w-0 flex-1 truncate text-right">{label}</span>
        {count !== undefined && (
          <span className="shrink-0 rounded-full bg-white/75 px-2 py-0.5 text-caption font-bold text-secondary-80 shadow-2xs">
            {formatNumber(count)}
          </span>
        )}
      </span>
    </button>
  );
}

// ============================================================
// SECTION: Overview — group info form + read-only meta
// ============================================================
function OverviewView({
  group,
  isOwner,
}: {
  group: GroupSettingsData;
  isOwner: boolean;
}) {
  const updateInfoMutation = useUpdateGroupInfo(group.id);
  const updateCoverMutation = useUpdateGroupCover(group.id);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(group.title);
  const [description, setDescription] = useState(group.description);

  const isClosed = group.status === 'CLOSED';
  const canEdit = isOwner && !isClosed;
  const hasChanges =
    title.trim() !== group.title.trim() ||
    description.trim() !== group.description.trim();

  const handlePhotoSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }
    if (file.size > GROUP_COVER_MAX_BYTES) {
      toast.error('حجم عکس باید کمتر از ۵ مگابایت باشد');
      return;
    }
    updateCoverMutation.mutate(file);
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle) {
      toast.error('نام اکیپ نمی‌تواند خالی باشد');
      return;
    }
    const payload: { title?: string; description?: string } = {};
    if (trimmedTitle !== group.title.trim()) payload.title = trimmedTitle;
    if (trimmedDescription !== group.description.trim())
      payload.description = trimmedDescription;
    if (payload.title === undefined && payload.description === undefined)
      return;
    updateInfoMutation.mutate(payload);
  };

  const metaRows = [
    { label: 'وضعیت', value: GROUP_STATUS_LABELS[group.status] },
    {
      label: 'نوع اکیپ',
      value: group.plan === 'PREMIUM' ? 'گروه پریمیوم' : 'گروه عادی',
    },
    { label: 'ساخته شده توسط', value: group.creator.name },
    { label: 'تاریخ ساخت', value: group.createdDateLabel },
    { label: 'تعداد اعضا', value: `${formatNumber(group.memberCount)} نفر` },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <GroupAvatar group={group} className="size-16 text-2xl" />
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={updateCoverMutation.isPending}
                aria-label="تغییر عکس اکیپ"
                className="absolute -bottom-1 -left-1 grid size-7 cursor-pointer place-items-center rounded-full bg-secondary-70 text-white shadow-xs ring-2 ring-white transition-all hover:bg-secondary-80 active:scale-95 disabled:opacity-60"
              >
                {updateCoverMutation.isPending ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Camera className="size-3.5" />
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handlePhotoSelect(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-heading-5 font-black text-primary-80">
            {group.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-caption text-neutral-60">
            {group.description || 'بدون توضیحات'}
          </p>
        </div>
      </div>

      {/* Editable info form (owner only) */}
      {isOwner && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="flex flex-col gap-3 rounded-2xl border border-neutral-20 bg-neutral-10/50 p-4"
        >
          <TextField
            label="نام اکیپ"
            value={title}
            maxLength={GROUP_TITLE_MAX_LENGTH}
            disabled={!canEdit}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="توضیحات"
            value={description}
            maxLength={GROUP_DESCRIPTION_MAX_LENGTH}
            disabled={!canEdit}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="ghost"
              tone="secondary"
              size="md"
              disabled={!hasChanges}
              onClick={() => {
                setTitle(group.title);
                setDescription(group.description);
              }}
            >
              بازگردانی
            </Button>
            <LoadingButton
              type="submit"
              tone="secondary"
              size="md"
              disabled={!canEdit || !hasChanges}
              isLoading={updateInfoMutation.isPending}
              loadingText="در حال ذخیره…"
              startIcon={<Save className="size-4 shrink-0" />}
            >
              ذخیره تغییرات
            </LoadingButton>
          </div>
        </form>
      )}

      {/* Read-only meta */}
      <dl className="flex flex-col divide-y divide-neutral-20 rounded-2xl border border-neutral-20 bg-white">
        {metaRows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3"
          >
            <dt className="text-caption text-neutral-60">{label}</dt>
            <dd className="text-paragraph-sm font-bold text-primary-80">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ============================================================
// SECTION: Members — list + inline delete & transfer ownership
// ============================================================
function MembersView({
  group,
  isOwner,
  onInvite,
}: {
  group: GroupSettingsData;
  isOwner: boolean;
  onInvite: () => void;
}) {
  const removeMemberMutation = useRemoveGroupMember(group.id);
  const transferOwnershipMutation = useTransferGroupOwnership(group.id);
  const [pendingAction, setPendingAction] = useState<{
    memberId: string;
    type: 'remove' | 'transfer';
  } | null>(null);

  const isClosed = group.status === 'CLOSED';
  const canInvite = isOwner && group.status === 'ACTIVE';
  const canManageMembers = isOwner && !isClosed;

  return (
    <div className="flex flex-col gap-3">
      {isOwner && (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onInvite}
            disabled={!canInvite}
            aria-label="افزودن اعضا"
            className="group flex h-9 shrink-0 cursor-pointer items-center rounded-full border border-secondary-60 bg-white text-secondary-70 shadow-2xs transition-colors duration-200 hover:border-secondary-50 hover:bg-secondary-10 hover:text-secondary-80 focus-visible:ring-2 focus-visible:ring-secondary-30 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="grid size-9 shrink-0 place-items-center">
              <UserPlus className="size-4" />
            </span>
            <span className="max-w-36 overflow-hidden ps-1 pe-3.5 text-xs font-bold whitespace-nowrap opacity-100 transition-[max-width,padding,opacity] duration-300 ease-out motion-reduce:transition-none md:max-w-0 md:ps-0 md:pe-0 md:opacity-0 md:group-hover:max-w-36 md:group-hover:ps-1 md:group-hover:pe-3.5 md:group-hover:opacity-100 md:group-focus-visible:max-w-36 md:group-focus-visible:ps-1 md:group-focus-visible:pe-3.5 md:group-focus-visible:opacity-100">
              افزودن اعضا
            </span>
          </button>
        </div>
      )}

      <ul className="flex flex-col divide-y divide-neutral-20 overflow-hidden rounded-2xl border border-neutral-20 bg-white">
        {group.members.map((member) => {
          const isMemberOwner = member.role === 'OWNER';
          const isConfirmingRemove =
            pendingAction?.memberId === member.memberId &&
            pendingAction.type === 'remove';
          const isConfirmingTransfer =
            pendingAction?.memberId === member.memberId &&
            pendingAction.type === 'transfer';

          return (
            <li
              key={member.memberId}
              className={cn(
                'flex min-h-13 items-center justify-between gap-3 px-3 py-1.5 transition-colors',
                isMemberOwner ? 'bg-secondary-10/70' : 'hover:bg-neutral-10/60',
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <MemberAvatar
                  member={{
                    id: member.memberId,
                    name: member.name,
                    avatarSrc: member.avatarSrc,
                  }}
                  className="size-9"
                />
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-paragraph-sm text-primary-80">
                    {member.name}
                  </span>
                  {isMemberOwner && (
                    <span className="shrink-0 rounded-full bg-secondary-20 px-2.5 py-0.5 text-caption font-bold text-secondary-80">
                      مالک
                    </span>
                  )}
                </div>
              </div>

              {!isMemberOwner && canManageMembers && (
                <div className="flex shrink-0 items-center gap-1">
                  {isConfirmingTransfer ? (
                    <InlineConfirm
                      prompt="انتقال مالکیت؟"
                      confirmLabel="تأیید"
                      loadingLabel="در حال انتقال…"
                      cancelAriaLabel="لغو انتقال مالکیت"
                      isLoading={transferOwnershipMutation.isPending}
                      tone="accent"
                      compact
                      onConfirm={() =>
                        transferOwnershipMutation.mutate(member.userId, {
                          onSuccess: () => setPendingAction(null),
                        })
                      }
                      onCancel={() => setPendingAction(null)}
                    />
                  ) : isConfirmingRemove ? (
                    <InlineConfirm
                      prompt="مطمئنی؟"
                      confirmLabel="حذف"
                      loadingLabel="در حال حذف…"
                      cancelAriaLabel="لغو حذف"
                      isLoading={removeMemberMutation.isPending}
                      tone="danger"
                      compact
                      onConfirm={() =>
                        removeMemberMutation.mutate(member.memberId, {
                          onSuccess: () => setPendingAction(null),
                        })
                      }
                      onCancel={() => setPendingAction(null)}
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAction({
                            memberId: member.memberId,
                            type: 'transfer',
                          })
                        }
                        aria-label={`انتقال مالکیت به ${member.name}`}
                        title="انتقال مالکیت"
                        className="grid size-8 cursor-pointer place-items-center rounded-lg text-neutral-50 transition-colors hover:bg-accent-10 hover:text-accent-70"
                      >
                        <Crown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAction({
                            memberId: member.memberId,
                            type: 'remove',
                          })
                        }
                        aria-label={`حذف ${member.name}`}
                        title="حذف عضو"
                        className="grid size-8 cursor-pointer place-items-center rounded-lg text-neutral-50 transition-colors hover:bg-danger-10 hover:text-danger-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ============================================================
// SECTION: Link — invite link + password / max uses / expiry / revoke
// ============================================================
function LinkForm({
  group,
  activeLink,
  isOwner,
}: {
  group: GroupSettingsData;
  activeLink: GroupInviteLink | null;
  isOwner: boolean;
}) {
  const saveLinkMutation = useSaveGroupInviteLink(group.id);
  const deactivateLinkMutation = useDeactivateGroupInviteLink(group.id);

  const [password, setPassword] = useState('');
  const [maxUses, setMaxUses] = useState<number | null>(
    activeLink?.maxUses ?? null,
  );
  const [expiryDate, setExpiryDate] = useState<string | null>(
    activeLink?.expiryDate ?? null,
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const isClosed = group.status === 'CLOSED';
  const isInactive = group.status !== 'ACTIVE';
  const canEdit = isOwner && !isClosed;
  const minExpiryDate = dateToApi(inIran());

  const handleCopyLink = async () => {
    if (!activeLink?.inviteUrl) return;
    try {
      await navigator.clipboard.writeText(activeLink.inviteUrl);
      setCopiedLink(true);
      toast.success('لینک دعوت با موفقیت کپی شد');
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedLink(false);
      }, 2500);
    } catch {
      toast.error('کپی لینک انجام نشد');
    }
  };

  const validateInvitePassword = (value: string): string | null => {
    const bytes = getUtf8ByteLength(value);
    if (bytes < INVITE_PASSWORD_MIN_BYTES) {
      return 'رمز عبور باید حداقل ۸ کاراکتر باشد.';
    }
    if (bytes > INVITE_PASSWORD_MAX_BYTES) {
      return 'رمز عبور بیش از حد مجاز طولانی است (حداکثر ۷۲ کاراکتر).';
    }
    return null;
  };

  const handleSave = () => {
    if (!activeLink) {
      const passwordError = validateInvitePassword(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
      saveLinkMutation.mutate(
        {
          password,
          maxUses,
          expiryDate,
        },
        {
          onSuccess: () => setPassword(''),
        },
      );
      return;
    }

    if (password.length > 0) {
      const passwordError = validateInvitePassword(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
    }

    const maxUsesChanged = maxUses !== activeLink.maxUses;
    const expiryDateChanged = expiryDate !== activeLink.expiryDate;
    const hasSendableInfoChange =
      (maxUsesChanged && maxUses != null) ||
      (expiryDateChanged && Boolean(expiryDate));

    if (!hasSendableInfoChange && password.length === 0) {
      toast.error(
        maxUsesChanged || expiryDateChanged
          ? 'برای تغییر محدودیت لینک، مقدار جدیدی وارد کنید یا لینک را ابطال کنید'
          : 'تغییری برای ذخیره وجود ندارد',
      );
      return;
    }

    saveLinkMutation.mutate(
      {
        inviteId: activeLink.id,
        password: password.length > 0 ? password : undefined,
        maxUses,
        expiryDate,
        maxUsesChanged,
        expiryDateChanged,
      },
      {
        onSuccess: () => setPassword(''),
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {activeLink ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-secondary-20 bg-secondary-10/70 p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="flex items-center gap-1.5 text-paragraph-sm font-bold text-secondary-80">
              <LinkIcon className="size-4 text-secondary-70" />
              لینک اختصاصی دعوت به اکیپ
            </h4>
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-caption font-bold text-secondary-80">
              {activeLink.maxUses !== null
                ? `${formatNumber(activeLink.usedCount)} از ${formatNumber(activeLink.maxUses)} استفاده`
                : `${formatNumber(activeLink.usedCount)} بار استفاده‌شده`}
            </span>
          </div>
          <p className="text-caption text-secondary-70">
            {isInactive
              ? 'عضویت با لینک برای اکیپ غیرفعال ممکن نیست.'
              : 'هر فرد با این لینک و رمز عبور می‌تواند به اکیپ ملحق شود.'}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <div className="min-w-0 flex-1">
              <input
                type="text"
                readOnly
                dir="ltr"
                value={activeLink.inviteUrl}
                className="h-9 w-full rounded-xl border border-secondary-30 bg-white px-3 font-mono text-xs text-secondary-80 outline-hidden select-all"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              tone="secondary"
              size="md"
              radius="md"
              disabled={!activeLink.inviteUrl}
              onClick={handleCopyLink}
              className="h-9 shrink-0 rounded-xl border-secondary-30 bg-white px-2.5 text-xs font-medium text-secondary-80 hover:bg-secondary-20/40"
            >
              <span className="grid grid-cols-1">
                <span
                  className={`col-start-1 row-start-1 flex items-center justify-center gap-1 transition-opacity duration-150 ${
                    copiedLink ? 'invisible opacity-0' : 'visible opacity-100'
                  }`}
                >
                  <Copy className="size-3.5 shrink-0" />
                  <span>کپی</span>
                </span>
                <span
                  className={`col-start-1 row-start-1 flex items-center justify-center gap-1 transition-opacity duration-150 ${
                    copiedLink ? 'visible opacity-100' : 'invisible opacity-0'
                  }`}
                >
                  <Check className="size-3.5 shrink-0" />
                  <span>کپی شد</span>
                </span>
              </span>
            </Button>
            {canEdit && (
              <button
                type="button"
                onClick={() => setConfirmDeactivate((prev) => !prev)}
                aria-label="ابطال و غیرفعال کردن لینک"
                title="ابطال لینک"
                className={cn(
                  'grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl border transition-colors',
                  confirmDeactivate
                    ? 'border-danger-30 bg-danger-10 text-danger-60'
                    : 'border-danger-20 bg-white text-danger-50 hover:border-danger-30 hover:bg-danger-10',
                )}
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>

          {canEdit && confirmDeactivate && (
            <div className="mt-1.5 flex items-center justify-end border-t border-secondary-20/70 pt-2">
              <InlineConfirm
                prompt="لینک فعلی غیرفعال شود؟"
                confirmLabel="تأیید ابطال"
                loadingLabel="در حال ابطال…"
                cancelAriaLabel="لغو ابطال لینک"
                isLoading={deactivateLinkMutation.isPending}
                tone="danger"
                compact
                onConfirm={() =>
                  deactivateLinkMutation.mutate(activeLink.id, {
                    onSuccess: () => setConfirmDeactivate(false),
                  })
                }
                onCancel={() => setConfirmDeactivate(false)}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 rounded-2xl border border-neutral-20 bg-neutral-10/60 p-4">
          <h4 className="flex items-center gap-1.5 text-paragraph-sm font-bold text-primary-80">
            <LinkIcon className="size-4 text-secondary-70" />
            لینک دعوت فعالی وجود ندارد
          </h4>
          <p className="text-caption text-neutral-60">
            {canEdit
              ? 'برای ساخت لینک دعوت جدید، یک رمز عبور حداقل ۸ کاراکتری تعیین و ذخیره کنید.'
              : 'مالک اکیپ هنوز لینک دعوت فعالی ایجاد نکرده است.'}
          </p>
        </div>
      )}

      {isOwner && (
        <div className="flex flex-col gap-5 rounded-2xl border border-neutral-20 bg-neutral-10/40 p-4">
          <PasswordField
            label={activeLink ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور لینک'}
            placeholder="••••••••"
            description="حداقل ۸ و حداکثر ۷۲ کاراکتر (حروف انگلیسی یا عدد)"
            error={
              getUtf8ByteLength(password) > INVITE_PASSWORD_MAX_BYTES
                ? 'رمز عبور بیش از حد مجاز طولانی است (حداکثر ۷۲ کاراکتر).'
                : undefined
            }
            fieldSize="lg"
            value={password}
            disabled={!canEdit}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <NumberField
              label="حداکثر استفاده"
              fieldSize="lg"
              value={maxUses ?? undefined}
              disabled={!canEdit}
              onValueChange={(val: number | null) => setMaxUses(val)}
              min={Math.max(1, activeLink?.usedCount ?? 1)}
              step={1}
            />
            <PersianDatePicker
              label="تاریخ ابطال"
              fieldSize="lg"
              value={expiryDate}
              min={minExpiryDate}
              disabled={!canEdit}
              onValueChange={(val: string | null) => setExpiryDate(val)}
            />
          </div>

          <div className="flex justify-end pt-1">
            <LoadingButton
              type="button"
              tone="secondary"
              size="md"
              radius="md"
              disabled={!canEdit}
              isLoading={saveLinkMutation.isPending}
              loadingText="در حال ذخیره…"
              onClick={handleSave}
              className="h-9 rounded-xl px-4 text-xs font-bold"
            >
              {activeLink ? 'ذخیره تغییرات لینک' : 'ساخت لینک دعوت'}
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
}

function LinkView({
  group,
  isOwner,
}: {
  group: GroupSettingsData;
  isOwner: boolean;
}) {
  const {
    data: links,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroupInviteLinks(group.id, true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-6 text-secondary-70" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-paragraph-sm text-danger-50">
          {getGroupErrorMessage(error, 'دریافت لینک‌های دعوت انجام نشد.')}
        </p>
        <Button
          type="button"
          variant="outline"
          tone="secondary"
          size="md"
          onClick={() => void refetch()}
        >
          تلاش مجدد
        </Button>
      </div>
    );
  }

  const activeLink =
    links?.find((link) => link.isActive && Boolean(link.token)) ?? null;

  return (
    <LinkForm
      key={`${activeLink?.id ?? 'new'}-${activeLink?.maxUses ?? 'none'}-${activeLink?.expiryDate ?? 'none'}`}
      group={group}
      activeLink={activeLink}
      isOwner={isOwner}
    />
  );
}

// ============================================================
// SECTION: Archive & Delete (owner) / Leave Group (member)
// ============================================================
function ArchiveView({
  group,
  isOwner,
  onClose,
  onGroupExit,
}: {
  group: GroupSettingsData;
  isOwner: boolean;
  onClose: () => void;
  onGroupExit?: () => void;
}) {
  const archiveMutation = useArchiveGroup(group.id);
  const deleteMutation = useDeleteGroup(group.id);
  const leaveMutation = useLeaveGroup(group.id);
  const [isConfirmingDeleteGroup, setIsConfirmingDeleteGroup] = useState(false);
  const [isConfirmingLeaveGroup, setIsConfirmingLeaveGroup] = useState(false);

  const isActive = group.status === 'ACTIVE';
  const isClosed = group.status === 'CLOSED';

  if (!isOwner) {
    return (
      <div className="flex flex-col gap-4">
        <article className="flex flex-col gap-2 rounded-2xl border border-danger-20 bg-danger-10 p-4 text-danger-50">
          <h4 className="flex items-center gap-1.5 text-paragraph-sm font-bold">
            <LogOut className="size-4.5 text-danger-40" />
            خروج از اکیپ
          </h4>
          <p className="text-caption leading-relaxed text-danger-50">
            {isClosed
              ? 'این اکیپ بسته شده و امکان خروج از آن وجود ندارد.'
              : 'با خروج از اکیپ، دسترسی شما به این اکیپ قطع می‌شود و تسویه‌های ورودی در انتظار شما لغو خواهند شد.'}
          </p>
          {!isClosed && (
            <div className="mt-2 flex items-center">
              {!isConfirmingLeaveGroup ? (
                <Button
                  type="button"
                  size="md"
                  radius="lg"
                  onClick={() => setIsConfirmingLeaveGroup(true)}
                  className="bg-danger-40 text-white hover:bg-danger-50 active:bg-danger-60"
                >
                  خروج از اکیپ
                </Button>
              ) : (
                <InlineConfirm
                  prompt="آیا از خروج مطمئنید؟"
                  confirmLabel="تأیید خروج"
                  loadingLabel="در حال خروج…"
                  cancelAriaLabel="لغو خروج از اکیپ"
                  isLoading={leaveMutation.isPending}
                  onConfirm={() =>
                    leaveMutation.mutate(undefined, {
                      onSuccess: () => {
                        setIsConfirmingLeaveGroup(false);
                        onClose();
                        onGroupExit?.();
                      },
                    })
                  }
                  onCancel={() => setIsConfirmingLeaveGroup(false)}
                />
              )}
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <article className="flex flex-col gap-2 rounded-2xl border border-accent-30 bg-accent-10 p-4 text-accent-80">
        <h4 className="flex items-center gap-1.5 text-paragraph-sm font-bold">
          <Archive className="size-4.5 text-accent-70" />
          {isActive ? 'آرشیو کردن اکیپ' : 'وضعیت آرشیو اکیپ'}
        </h4>
        <p className="text-caption leading-relaxed">
          {isActive
            ? 'با آرشیو کردن، اکیپ وارد وضعیت تسویه می‌شود و ثبت هزینه، نظرسنجی و قرعه‌کشی جدید غیرفعال می‌گردد؛ تسویه‌ها و مرور تاریخچه همچنان در دسترس می‌مانند. این تغییر یک‌طرفه است.'
            : isClosed
              ? 'این اکیپ به‌صورت کامل بسته شده و تمام بخش‌های آن فقط‌خواندنی هستند.'
              : 'این اکیپ آرشیو شده و در وضعیت تسویه قرار دارد. امکان بازگرداندن به حالت فعال وجود ندارد.'}
        </p>
        {isActive && (
          <div className="mt-2 flex justify-start">
            <LoadingButton
              type="button"
              variant="outline"
              tone="accent"
              size="md"
              radius="lg"
              isLoading={archiveMutation.isPending}
              loadingText="در حال اعمال…"
              onClick={() => archiveMutation.mutate()}
            >
              آرشیو کردن این اکیپ
            </LoadingButton>
          </div>
        )}
      </article>

      <article className="flex flex-col gap-2 rounded-2xl border border-danger-20 bg-danger-10 p-4 text-danger-50">
        <h4 className="flex items-center gap-1.5 text-paragraph-sm font-bold">
          <Trash2 className="size-4.5 text-danger-40" />
          حذف کامل اکیپ
        </h4>
        <p className="text-caption leading-relaxed text-danger-50">
          {isClosed
            ? 'اکیپ بسته‌شده قابل حذف نیست.'
            : 'این اقدام قابل بازگشت نیست. اکیپ‌هایی که سابقه تسویه دارند قابل حذف نیستند.'}
        </p>
        {!isClosed && (
          <div className="mt-2 flex items-center">
            {!isConfirmingDeleteGroup ? (
              <Button
                type="button"
                size="md"
                radius="lg"
                onClick={() => setIsConfirmingDeleteGroup(true)}
                className="bg-danger-40 text-white hover:bg-danger-50 active:bg-danger-60"
              >
                حذف دائم اکیپ
              </Button>
            ) : (
              <InlineConfirm
                prompt="آیا از حذف دائم مطمئنید؟"
                confirmLabel="حذف دائم"
                loadingLabel="در حال حذف…"
                cancelAriaLabel="لغو حذف اکیپ"
                isLoading={deleteMutation.isPending}
                onConfirm={() =>
                  deleteMutation.mutate(undefined, {
                    onSuccess: () => {
                      setIsConfirmingDeleteGroup(false);
                      onClose();
                      onGroupExit?.();
                    },
                  })
                }
                onCancel={() => setIsConfirmingDeleteGroup(false)}
              />
            )}
          </div>
        )}
      </article>
    </div>
  );
}

// ============================================================
// Dialog shell: settings nav (Discord-style) + content pane
// ============================================================
function GroupSettingsContent({
  group,
  isOwner,
  section,
  onSectionChange,
  onOpenInvite,
  onClose,
  onGroupExit,
}: {
  group: GroupSettingsData;
  isOwner: boolean;
  section: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  onOpenInvite: () => void;
  onClose: () => void;
  onGroupExit?: () => void;
}) {
  const memberCount = group.members.length;
  const dangerLabel = isOwner ? 'آرشیو و حذف' : 'خروج از اکیپ';

  const sections: { id: SettingsSection; label: string }[] = [
    { id: 'overview', label: 'اطلاعات اکیپ' },
    { id: 'members', label: 'اعضا' },
    { id: 'link', label: 'لینک و رمز' },
    { id: 'archive', label: dangerLabel },
  ];

  const sectionTitles: Record<SettingsSection, string> = {
    overview: 'اطلاعات اکیپ',
    members: 'اعضای اکیپ',
    link: 'لینک و رمز دعوت',
    archive: dangerLabel,
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-hidden font-sans md:grid-cols-[248px_1fr]">
      <DialogTitle className="sr-only">تنظیمات اکیپ {group.title}</DialogTitle>
      <DialogDescription className="sr-only">
        مدیریت اطلاعات اکیپ، اعضا، لینک دعوت و وضعیت اکیپ
      </DialogDescription>

      {/* Settings nav (desktop) */}
      <nav
        aria-label="بخش‌های تنظیمات"
        className="relative hidden min-h-0 flex-col overflow-hidden border-l border-neutral-20 bg-secondary-10 p-3 md:flex"
      >
        <img
          src={settingsNavBg}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-bottom"
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col items-center px-2 pt-5 pb-3 text-center">
            <GroupAvatar group={group} className="size-18 shrink-0 text-2xl" />
            <h3 className="mt-3 line-clamp-1 w-full text-heading-5 font-black text-primary-80">
              {group.title}
            </h3>
            <div className="mt-2.5">
              <StatusChip status={group.status} />
            </div>
          </div>

          <ul className="flex flex-col gap-1">
            {sections.map(({ id, label }) => {
              const isDanger = id === 'archive';
              const icon = isDanger
                ? isOwner
                  ? Archive
                  : LogOut
                : SECTION_ICONS[id];
              return (
                <li key={id}>
                  <NavItem
                    label={label}
                    icon={icon}
                    active={section === id}
                    danger={isDanger}
                    count={id === 'members' ? memberCount : undefined}
                    onClick={() => onSectionChange(id)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Content pane */}
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        <Button
          type="button"
          variant="ghost"
          size="icon-md"
          onClick={onClose}
          aria-label="بستن تنظیمات"
          className="hover:text-neutral-90 absolute top-2.5 left-2.5 z-10 hidden text-neutral-60 md:grid"
        >
          <X className="size-5" />
        </Button>

        {/* Mobile: themed header card + icon-segmented navigation bar */}
        <div className="shrink-0 md:hidden">
          <div className="relative overflow-hidden border-b border-secondary-20/70 bg-secondary-10/75 px-4 py-3.5">
            <img
              src={settingsNavBg}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top opacity-85"
            />
            <div className="relative z-10 flex items-center gap-3">
              <GroupAvatar
                group={group}
                className="size-12 shrink-0 rounded-2xl text-base"
              />
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 text-heading-6 font-black text-primary-80">
                  {group.title}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <StatusChip status={group.status} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-2 py-0.5 text-caption font-bold text-primary-70 ring-1 ring-neutral-30/50">
                    <Users className="size-3 text-secondary-70" />
                    {formatNumber(memberCount)} نفر
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                onClick={onClose}
                aria-label="بستن تنظیمات"
                className="size-9 shrink-0 rounded-xl bg-white/75 text-neutral-70 shadow-2xs ring-1 ring-neutral-30/50 backdrop-blur-xs hover:bg-white"
              >
                <X className="size-4.5" />
              </Button>
            </div>
          </div>

          <div className="border-b border-neutral-20/80 bg-white px-3 py-2.5">
            <div
              role="tablist"
              aria-label="بخش‌های تنظیمات"
              className="flex [scrollbar-width:none] items-center gap-1 overflow-x-auto rounded-2xl bg-neutral-10/90 p-1 [&::-webkit-scrollbar]:hidden"
            >
              {sections.map(({ id, label }) => {
                const Icon =
                  id === 'archive'
                    ? isOwner
                      ? Archive
                      : LogOut
                    : SECTION_ICONS[id];
                const isActive = section === id;
                const isDanger = id === 'archive';
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onSectionChange(id)}
                    className={cn(
                      'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                      isActive
                        ? isDanger
                          ? 'bg-danger-10 text-danger-50 shadow-2xs ring-1 ring-danger-20'
                          : 'bg-white text-secondary-80 shadow-2xs ring-1 ring-secondary-20/80'
                        : isDanger
                          ? 'text-danger-50/85 hover:bg-danger-10/50 hover:text-danger-50'
                          : 'text-neutral-60 hover:bg-white/60 hover:text-primary-80',
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" strokeWidth={2} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop: section header */}
        <header className="hidden items-center border-b border-neutral-20 px-6 py-4 pl-12 md:flex">
          <h2 className="text-heading-5 font-black text-primary-80">
            {sectionTitles[section]}
          </h2>
        </header>

        {/* Section body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
          {section === 'overview' && (
            <OverviewView
              key={`${group.id}-${group.title}-${group.description}`}
              group={group}
              isOwner={isOwner}
            />
          )}
          {section === 'members' && (
            <MembersView
              group={group}
              isOwner={isOwner}
              onInvite={onOpenInvite}
            />
          )}
          {section === 'link' && <LinkView group={group} isOwner={isOwner} />}
          {section === 'archive' && (
            <ArchiveView
              group={group}
              isOwner={isOwner}
              onClose={onClose}
              onGroupExit={onGroupExit}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export function GroupSettingsDialog({
  groupId,
  currentUserId,
  open,
  onOpenChange,
  onGroupExit,
}: GroupSettingsDialogProps) {
  const [section, setSection] = useState<SettingsSection>('members');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const {
    data: group,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroupSettings(groupId, open);

  if (!open) return null;

  const isOwner = Boolean(
    currentUserId &&
    group?.members.some(
      (member) => member.userId === currentUserId && member.role === 'OWNER',
    ),
  );

  const handleSettingsOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsInviteOpen(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <>
      <Dialog
        open={open && !isInviteOpen}
        onOpenChange={handleSettingsOpenChange}
      >
        <DialogContent className="h-[min(86dvh,640px)] w-[calc(100%-1.5rem)] max-w-[860px] overflow-hidden rounded-2xl p-0 font-sans sm:w-[calc(100%-2.5rem)] md:h-[580px] md:max-h-[calc(100dvh-2rem)]">
          {isLoading ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 p-6">
              <DialogTitle className="sr-only">تنظیمات اکیپ</DialogTitle>
              <DialogDescription className="sr-only">
                در حال بارگذاری اطلاعات اکیپ
              </DialogDescription>
              <Spinner className="size-7 text-secondary-70" />
              <p className="text-paragraph-sm text-neutral-60">
                در حال دریافت اطلاعات اکیپ…
              </p>
            </div>
          ) : isError || !group ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center">
              <DialogTitle className="text-heading-5 font-bold text-primary-80">
                خطا در دریافت تنظیمات اکیپ
              </DialogTitle>
              <DialogDescription className="text-paragraph-sm text-danger-50">
                {getGroupErrorMessage(error, 'اطلاعات اکیپ در دسترس نیست.')}
              </DialogDescription>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  tone="secondary"
                  size="md"
                  onClick={() => void refetch()}
                >
                  تلاش مجدد
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  tone="secondary"
                  size="md"
                  onClick={() => handleSettingsOpenChange(false)}
                >
                  بستن
                </Button>
              </div>
            </div>
          ) : (
            <GroupSettingsContent
              key={groupId}
              group={group}
              isOwner={isOwner}
              section={section}
              onSectionChange={setSection}
              onOpenInvite={() => setIsInviteOpen(true)}
              onClose={() => handleSettingsOpenChange(false)}
              onGroupExit={onGroupExit}
            />
          )}
        </DialogContent>
      </Dialog>

      {isOwner && group && (
        <InviteMemberDialog
          groupId={group.id}
          existingMembers={group.members}
          open={open && isInviteOpen}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setIsInviteOpen(false);
          }}
          onBack={() => setIsInviteOpen(false)}
        />
      )}
    </>
  );
}

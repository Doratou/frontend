import { useRef, useState } from 'react';
import {
  Archive,
  Camera,
  Check,
  Copy,
  Info,
  Link as LinkIcon,
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
import { formatNumber } from '@/utils/format';
import { cn } from '@/lib/utils';
import bgGroupOpen from '@/assets/sidebar/group-open.svg';
import {
  useArchiveGroup,
  useDeleteGroup,
  useGroupSettings,
  useRemoveGroupMember,
  useUpdateGroupInfo,
  useUpdateGroupLink,
  useUpdateGroupPhoto,
} from '../hooks/use-group-settings';
import type { GroupSettingsData } from '../types';
import { InviteMemberDialog } from './InviteMemberDialog';
import { MemberAvatar } from './MemberAvatar';

interface GroupSettingsDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsSection = 'overview' | 'members' | 'link' | 'archive';

const SECTIONS: { id: SettingsSection; label: string }[] = [
  { id: 'overview', label: 'اطلاعات اکیپ' },
  { id: 'members', label: 'اعضا' },
  { id: 'link', label: 'لینک و رمز' },
  { id: 'archive', label: 'آرشیو و حذف' },
];

const SECTION_TITLES: Record<SettingsSection, string> = {
  overview: 'اطلاعات اکیپ',
  members: 'اعضای اکیپ',
  link: 'لینک و رمز دعوت',
  archive: 'آرشیو و حذف',
};

const SECTION_ICONS: Record<SettingsSection, typeof Users> = {
  overview: Info,
  members: Users,
  link: LinkIcon,
  archive: Archive,
};

function StatusChip({ isArchived }: { isArchived: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-bold shadow-2xs ring-1',
        isArchived
          ? 'bg-white/70 text-neutral-60 ring-neutral-30/60'
          : 'bg-white/70 text-secondary-80 ring-secondary-30/60',
      )}
    >
      <span className="relative flex size-2">
        {!isArchived && (
          <span
            aria-hidden="true"
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary-60 opacity-60 motion-reduce:hidden"
          />
        )}
        <span
          className={cn(
            'relative inline-flex size-2 rounded-full',
            isArchived ? 'bg-neutral-40' : 'bg-secondary-60',
          )}
        />
      </span>
      {isArchived ? 'آرشیوشده' : 'فعال'}
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
  if (group.groupPhotoSrc) {
    return (
      <img
        src={group.groupPhotoSrc}
        alt={group.title}
        draggable={false}
        className={cn('rounded-[18px] object-cover', className)}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'grid place-items-center rounded-[18px] border border-neutral-30/80 bg-white text-secondary-70 shadow-xs',
        className,
      )}
    >
      <span className="font-black">{group.title.charAt(0)}</span>
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

function NavItem({ label, icon: Icon, active, danger = false, count, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active || undefined}
      className={cn(
        'group relative flex h-11 w-full cursor-pointer items-center overflow-hidden rounded-2xl border-[1.5px] transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-60',
        danger
          ? 'border-danger-50 bg-danger-10 hover:bg-danger-20/55'
          : active
            ? 'border-transparent bg-secondary-20'
            : 'border-transparent bg-transparent hover:bg-secondary-20/50',
      )}
    >
      {/* Sidebar-style start-edge indicator for the active item */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1/2 right-0.5 h-5.5 w-0.9 -translate-y-1/2 rounded-xs bg-secondary-60 transition-opacity duration-200 motion-reduce:transition-none',
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
          'flex min-w-0 flex-1 items-center gap-2 pl-3',
          danger
            ? 'text-xs leading-5 font-medium text-danger-50'
            : 'text-sm leading-5.5 font-medium text-primary-80',
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

// Resize + compress the picked image so the data URL fits comfortably in
// localStorage-backed mock storage.
function readImageAsDataUrl(file: File, maxSize = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(reader.result as string);
          return;
        }
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('invalid_image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('read_failed'));
    reader.readAsDataURL(file);
  });
}

// ============================================================
// SECTION: Overview — group info form + read-only meta
// ============================================================
function OverviewView({ group }: { group: GroupSettingsData }) {
  const updateInfoMutation = useUpdateGroupInfo(group.id);
  const updatePhotoMutation = useUpdateGroupPhoto(group.id);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(group.title);
  const [description, setDescription] = useState(group.description);

  const isArchived = group.status === 'ARCHIVED';

  const handlePhotoSelect = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم عکس باید کمتر از ۵ مگابایت باشد');
      return;
    }
    try {
      const dataUrl = await readImageAsDataUrl(file);
      updatePhotoMutation.mutate(dataUrl);
    } catch {
      toast.error('خواندن فایل عکس انجام نشد');
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('نام اکیپ نمی‌تواند خالی باشد');
      return;
    }
    updateInfoMutation.mutate({ title, description });
  };

  const metaRows = [
    { label: 'وضعیت', value: isArchived ? 'آرشیوشده' : 'فعال' },
    {
      label: 'نوع اکیپ',
      value: group.plan === 'PREMIUM' ? 'گروه پریمیوم' : 'گروه عادی',
    },
    { label: 'ساخته شده توسط', value: group.creator.name },
    { label: 'تاریخ ساخت', value: group.createdDateLabel },
    { label: 'بازه سفر', value: group.dateRangeLabel },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <GroupAvatar group={group} className="size-16 text-2xl" />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            aria-label="تغییر عکس اکیپ"
            className="absolute -bottom-1 -left-1 grid size-7 cursor-pointer place-items-center rounded-full bg-secondary-70 text-white shadow-xs ring-2 ring-white transition-all hover:bg-secondary-80 active:scale-95"
          >
            {updatePhotoMutation.isPending ? (
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
              void handlePhotoSelect(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        <div className="min-w-0">
          <DialogTitle className="line-clamp-1 text-heading-5 font-black text-primary-80">
            {group.title}
          </DialogTitle>
          <DialogDescription className="mt-1 line-clamp-2 text-caption text-neutral-60">
            {group.description || 'بدون توضیحات'}
          </DialogDescription>
          {group.groupPhotoSrc && (
            <button
              type="button"
              onClick={() => updatePhotoMutation.mutate('')}
              className="mt-1.5 inline-flex cursor-pointer items-center gap-1 text-caption font-bold text-danger-50 transition-colors hover:text-danger-60"
            >
              <Trash2 className="size-3" />
              حذف عکس
            </button>
          )}
        </div>
      </div>

      {/* Editable info form */}
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
          disabled={isArchived}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="توضیحات"
          value={description}
          disabled={isArchived}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="ghost"
            tone="secondary"
            size="md"
            disabled={title === group.title && description === group.description}
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
            disabled={isArchived}
            isLoading={updateInfoMutation.isPending}
            loadingText="در حال ذخیره…"
            startIcon={<Save className="size-4 shrink-0" />}
          >
            ذخیره تغییرات
          </LoadingButton>
        </div>
      </form>

      {/* Read-only meta */}
      <dl className="flex flex-col divide-y divide-neutral-20 rounded-2xl border border-neutral-20 bg-white">
        {metaRows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <dt className="text-caption text-neutral-60">{label}</dt>
            <dd className="text-paragraph-sm font-bold text-primary-80">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ============================================================
// SECTION: Members — searchable list + inline delete confirm
// ============================================================
function MembersView({ group, onInvite }: { group: GroupSettingsData; onInvite: () => void }) {
  const removeMemberMutation = useRemoveGroupMember(group.id);
  const [pendingDeleteMemberId, setPendingDeleteMemberId] = useState<string | null>(null);

  const isArchived = group.status === 'ARCHIVED';

  const handleConfirmDeleteMember = (memberId: string) => {
    removeMemberMutation.mutate(memberId, {
      onSuccess: () => {
        setPendingDeleteMemberId(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-start">
        {/* Expanding invite button: a 36px circle whose label slides out on
            hover / keyboard focus. */}
        <button
          type="button"
          onClick={onInvite}
          disabled={isArchived}
          aria-label="افزودن اعضا"
          className="group flex h-9 shrink-0 cursor-pointer items-center rounded-full border border-secondary-60 bg-white text-secondary-70 shadow-2xs transition-colors duration-200 hover:border-secondary-50 hover:bg-secondary-10 hover:text-secondary-80 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary-30 disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="grid size-9 shrink-0 place-items-center">
            <UserPlus className="size-4" />
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold opacity-0 transition-[max-width,padding,opacity] duration-300 ease-out group-focus-visible:max-w-36 group-focus-visible:pe-3.5 group-focus-visible:ps-2 group-focus-visible:opacity-100 group-hover:max-w-36 group-hover:pe-3.5 group-hover:ps-2 group-hover:opacity-100 motion-reduce:transition-none">
            افزودن اعضا
          </span>
        </button>
      </div>

      <ul className="flex flex-col divide-y divide-neutral-20 overflow-hidden rounded-2xl border border-neutral-20 bg-white">
        {group.members.map((member) => {
          const isOwner = member.role === 'OWNER';
          const isConfirming = pendingDeleteMemberId === member.id;

          return (
            <li
              key={member.id}
              className={cn(
                'flex min-h-13 items-center justify-between gap-3 px-3 py-1.5 transition-colors',
                isOwner ? 'bg-secondary-10/70' : 'hover:bg-neutral-10/60',
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <MemberAvatar member={{ id: member.id, name: member.name }} className="size-9" />
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-paragraph-sm text-primary-80">{member.name}</span>
                  {isOwner && (
                    <span className="shrink-0 rounded-full bg-secondary-20 px-2.5 py-0.5 text-caption font-bold text-secondary-80">
                      مالک
                    </span>
                  )}
                </div>
              </div>

              {/* Inline delete control (non-owner only) */}
              {!isOwner && !isArchived && (
                <div className="flex shrink-0 items-center">
                  {!isConfirming ? (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteMemberId(member.id)}
                      aria-label={`حذف ${member.name}`}
                      className="grid size-8 cursor-pointer place-items-center rounded-lg text-neutral-50 transition-colors hover:bg-danger-10 hover:text-danger-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-danger-50 animate-in fade-in slide-in-from-right-2 duration-150">
                      <span>مطمئنی؟</span>
                      <button
                        type="button"
                        onClick={() => handleConfirmDeleteMember(member.id)}
                        disabled={removeMemberMutation.isPending}
                        className="cursor-pointer rounded-lg bg-danger-40 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-danger-50"
                      >
                        حذف
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteMemberId(null)}
                        aria-label="لغو حذف"
                        className="grid size-7 cursor-pointer place-items-center rounded-md text-neutral-50 hover:bg-neutral-20 hover:text-neutral-70"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
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
// SECTION: Link — invite link + password / max uses / expiry
// ============================================================
function LinkView({ group }: { group: GroupSettingsData }) {
  const updateLinkMutation = useUpdateGroupLink(group.id);
  const [password, setPassword] = useState(group.linkSettings.password);
  const [maxUses, setMaxUses] = useState<number | null>(group.linkSettings.maxUses);
  const [expiryDate, setExpiryDate] = useState<string | null>(group.linkSettings.expiryDate);
  const [copiedLink, setCopiedLink] = useState(false);

  const isArchived = group.status === 'ARCHIVED';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(group.linkSettings.inviteUrl);
      setCopiedLink(true);
      toast.success('لینک دعوت با موفقیت کپی شد');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error('کپی لینک انجام نشد');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Invite link card */}
      <div className="flex flex-col gap-2 rounded-2xl border border-secondary-20 bg-secondary-10/70 p-4">
        <h4 className="flex items-center gap-1.5 text-paragraph-sm font-bold text-secondary-80">
          <LinkIcon className="size-4 text-secondary-70" />
          لینک اختصاصی دعوت به اکیپ
        </h4>
        <p className="text-caption text-secondary-70">
          {isArchived
            ? 'دعوت اعضا برای اکیپ آرشیوشده غیرفعال است.'
            : 'هر فرد با این لینک و رمز عبور می‌تواند به اکیپ ملحق شود.'}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex-1">
            <input
              type="text"
              readOnly
              dir="ltr"
              value={group.linkSettings.inviteUrl}
              className="h-10 w-full rounded-xl border border-secondary-30 bg-white px-3 font-mono text-xs text-secondary-80 outline-hidden select-all"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            tone="secondary"
            size="md"
            radius="lg"
            disabled={isArchived}
            onClick={handleCopyLink}
            className="h-10 shrink-0 rounded-xl px-4 font-bold"
          >
            {/* Both labels stack in one grid cell, so the button width is
                always sized by the widest state and never jumps. */}
            <span className="grid grid-cols-1">
              <span
                className={`col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-opacity duration-150 ${
                  copiedLink ? 'invisible opacity-0' : 'visible opacity-100'
                }`}
              >
                <Copy className="size-4 shrink-0" />
                <span>کپی</span>
              </span>
              <span
                className={`col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-opacity duration-150 ${
                  copiedLink ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
              >
                <Check className="size-4 shrink-0" />
                <span>کپی شد</span>
              </span>
            </span>
          </Button>
        </div>
      </div>

      {/* Settings inputs */}
      <div className="flex flex-col gap-3">
        <PasswordField
          label="رمز عبور"
          fieldSize="md"
          value={password}
          disabled={isArchived}
          onChange={(e) => setPassword(e.target.value)}
        />
        <NumberField
          label="حداکثر استفاده"
          fieldSize="md"
          value={maxUses ?? undefined}
          disabled={isArchived}
          onValueChange={(val: number | null) => setMaxUses(val)}
          min={1}
          step={1}
        />
        <PersianDatePicker
          label="تاریخ ابطال"
          fieldSize="md"
          value={expiryDate}
          disabled={isArchived}
          onValueChange={(val: string | null) => setExpiryDate(val)}
        />
      </div>

      <div className="flex justify-end pt-2">
        <LoadingButton
          type="button"
          tone="secondary"
          size="md"
          disabled={isArchived}
          isLoading={updateLinkMutation.isPending}
          loadingText="در حال ذخیره…"
          onClick={() =>
            updateLinkMutation.mutate({
              password,
              maxUses,
              expiryDate,
            })
          }
        >
          ذخیره تغییرات لینک
        </LoadingButton>
      </div>
    </div>
  );
}

// ============================================================
// SECTION: Archive — toggle archive + permanent delete
// ============================================================
function ArchiveView({ group, onClose }: { group: GroupSettingsData; onClose: () => void }) {
  const archiveMutation = useArchiveGroup(group.id);
  const deleteMutation = useDeleteGroup(group.id);
  const [isConfirmingDeleteGroup, setIsConfirmingDeleteGroup] = useState(false);

  const isArchived = group.status === 'ARCHIVED';

  return (
    <div className="flex flex-col gap-4">
      {/* Warning / archive card */}
      <article className="flex flex-col gap-2 rounded-2xl border border-accent-30 bg-accent-10 p-4 text-accent-80">
        <h4 className="flex items-center gap-1.5 text-paragraph-sm font-bold">
          <Archive className="size-4.5 text-accent-70" />
          {isArchived ? 'بازگرداندن اکیپ از آرشیو' : 'آرشیو کردن اکیپ'}
        </h4>
        <p className="text-caption leading-relaxed">
          {isArchived
            ? 'اکیپ به صفحهٔ اصلی برمی‌گردد و امکان ویرایش دوباره فعال می‌شود.'
            : 'با آرشیو کردن، ویرایش اکیپ غیرفعال می‌شود. اعضا همچنان می‌توانند خاطره‌ها و تصاویر را مرور کنند.'}
        </p>
        <div className="mt-2 flex justify-start">
          <LoadingButton
            type="button"
            variant="outline"
            tone="accent"
            size="md"
            radius="lg"
            isLoading={archiveMutation.isPending}
            loadingText="در حال اعمال…"
            onClick={() => archiveMutation.mutate(!isArchived)}
          >
            {isArchived ? 'بازگرداندن اکیپ' : 'آرشیو کردن این اکیپ'}
          </LoadingButton>
        </div>
      </article>

      {/* Danger / delete card */}
      <article className="flex flex-col gap-2 rounded-2xl border border-danger-20 bg-danger-10 p-4 text-danger-50">
        <h4 className="flex items-center gap-1.5 text-paragraph-sm font-bold">
          <Trash2 className="size-4.5 text-danger-40" />
          حذف کامل اکیپ
        </h4>
        <p className="text-caption leading-relaxed text-danger-50">
          این اقدام قابل بازگشت نیست. با حذف اکیپ، چک‌لیست‌ها، تراکنش‌ها و تصاویر آن پاک می‌شوند.
        </p>
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
            <div className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-xs animate-in fade-in slide-in-from-right-2 duration-150">
              <span className="text-xs font-bold text-danger-50">آیا از حذف دائم مطمئنید؟</span>
              <LoadingButton
                type="button"
                size="md"
                radius="lg"
                isLoading={deleteMutation.isPending}
                loadingText="در حال حذف…"
                onClick={() =>
                  deleteMutation.mutate(undefined, {
                    onSuccess: () => {
                      setIsConfirmingDeleteGroup(false);
                      onClose();
                    },
                  })
                }
                className="bg-danger-40 text-white hover:bg-danger-50 active:bg-danger-60"
              >
                حذف دائم
              </LoadingButton>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                onClick={() => setIsConfirmingDeleteGroup(false)}
                aria-label="لغو حذف اکیپ"
                className="text-neutral-60 hover:text-neutral-90"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

// ============================================================
// Dialog shell: settings nav (Discord-style) + content pane
// ============================================================
function GroupSettingsContent({
  group,
  onClose,
}: {
  group: GroupSettingsData;
  onClose: () => void;
}) {
  const [section, setSection] = useState<SettingsSection>('members');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const isArchived = group.status === 'ARCHIVED';
  const memberCount = group.members.length;

  return (
    <div className="grid h-full min-h-0 grid-cols-1 overflow-hidden font-sans md:grid-cols-[248px_1fr]">
      {/* ==========================================================
          Settings nav (desktop; RTL grid puts this column on the right).
          Styled after the app sidebar (group theme artwork + pills).
      ========================================================== */}
      <nav
        aria-label="بخش‌های تنظیمات"
        className="relative hidden min-h-0 flex-col overflow-hidden border-l border-neutral-20 bg-secondary-10 p-3 md:flex"
      >
        {/* Sidebar-style themed artwork (same asset the group sidebar uses) */}
        <img
          src={bgGroupOpen}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        />

        <div className="relative z-10 flex min-h-0 flex-col">
          {/* Compact group profile */}
          <div className="flex flex-col items-center px-2 pb-4 pt-7 text-center">
            <GroupAvatar group={group} className="size-18 shrink-0 text-2xl" />
            <h3 className="mt-3 line-clamp-1 w-full text-heading-5 font-black text-primary-80">
              {group.title}
            </h3>
            <div className="mt-2.5">
              <StatusChip isArchived={isArchived} />
            </div>
          </div>

          <ul className="flex flex-col gap-1">
            {SECTIONS.filter((s) => s.id !== 'archive').map(({ id, label }) => (
              <li key={id}>
                <NavItem
                  label={label}
                  icon={SECTION_ICONS[id]}
                  active={section === id}
                  count={id === 'members' ? memberCount : undefined}
                  onClick={() => setSection(id)}
                />
              </li>
            ))}
          </ul>

          {/* Danger zone pinned to the bottom (sidebar danger pill style) */}
          <div className="mt-auto flex flex-col gap-1 pt-3">
            <NavItem
              label="آرشیو و حذف"
              icon={SECTION_ICONS.archive}
              active={section === 'archive'}
              danger
              onClick={() => setSection('archive')}
            />
          </div>
        </div>
      </nav>

      {/* ==========================================================
          Content pane
      ========================================================== */}
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        {/* Close button (desktop; sits in the corner away from the nav) */}
        <Button
          type="button"
          variant="ghost"
          size="icon-md"
          onClick={onClose}
          aria-label="بستن تنظیمات"
          className="absolute top-2.5 left-2.5 z-10 hidden text-neutral-60 hover:text-neutral-90 md:grid"
        >
          <X className="size-5" />
        </Button>

        {/* Mobile: compact profile + horizontal section pills */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 border-b border-neutral-20 px-4 py-3">
            <GroupAvatar group={group} className="size-11 shrink-0 rounded-xl text-base" />
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-heading-6 font-black text-primary-80">
                {group.title}
              </h3>
              <div className="mt-1">
                <StatusChip isArchived={isArchived} />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              onClick={onClose}
              aria-label="بستن تنظیمات"
              className="shrink-0 text-neutral-60 hover:text-neutral-90"
            >
              <X className="size-5" />
            </Button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto border-b border-neutral-20 px-3 py-2">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-current={section === id || undefined}
                onClick={() => setSection(id)}
                className={cn(
                  'shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-caption font-bold transition-colors',
                  id === 'archive' && 'text-danger-50',
                  section === id
                    ? id === 'archive'
                      ? 'bg-danger-10 text-danger-50'
                      : 'bg-secondary-10 text-secondary-80'
                    : 'bg-neutral-10 text-neutral-60 hover:bg-neutral-20/60',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: section header */}
        <header className="hidden items-center border-b border-neutral-20 px-6 py-4 pl-12 md:flex">
          <h2 className="text-heading-5 font-black text-primary-80">
            {SECTION_TITLES[section]}
          </h2>
        </header>

        {/* Section body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {section === 'overview' && <OverviewView group={group} />}
          {section === 'members' && (
            <MembersView group={group} onInvite={() => setIsInviteOpen(true)} />
          )}
          {section === 'link' && <LinkView group={group} />}
          {section === 'archive' && <ArchiveView group={group} onClose={onClose} />}
        </div>
      </main>

      {/* Invite member dialog */}
      <InviteMemberDialog
        groupId={group.id}
        existingMembers={group.members}
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  );
}

export function GroupSettingsDialog({
  groupId,
  open,
  onOpenChange,
}: GroupSettingsDialogProps) {
  const { data: group } = useGroupSettings(groupId);

  if (!open || !group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[860px] overflow-hidden rounded-2xl p-0 font-sans md:h-[580px] md:max-h-[calc(100dvh-2rem)]">
        <GroupSettingsContent
          key={groupId}
          group={group}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

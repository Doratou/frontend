import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Link as LinkIcon, Trash2 } from 'lucide-react';
import { LoadingButton } from '@/components/custom/loading-button';
import { NumberField } from '@/components/custom/number-field';
import { PasswordField } from '@/components/custom/password-field';
import { PersianDatePicker } from '@/components/custom/persian-picker';
import { toast } from '@/components/custom/toast';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getApiErrorMessage } from '@/lib/api/error';
import { dateToApi, inIran } from '@/lib/persian-date';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';
import {
  getUtf8ByteLength,
  INVITE_PASSWORD_MAX_BYTES,
  INVITE_PASSWORD_MIN_BYTES,
} from '../../constants';
import {
  useDeactivateGroupInviteLink,
  useGroupInviteLinks,
  useSaveGroupInviteLink,
} from '../../hooks/use-group-settings';
import type { GroupInviteLink, GroupSettingsData } from '../../types';
import { useGroupSettingsContext } from './group-settings-context';
import { InlineConfirm } from './GroupSettingsShared';

function validateInvitePassword(value: string): string | null {
  if (value.length < INVITE_PASSWORD_MIN_BYTES) {
    return 'رمز عبور باید حداقل ۸ کاراکتر باشد.';
  }
  if (getUtf8ByteLength(value) > INVITE_PASSWORD_MAX_BYTES) {
    return 'رمز عبور بیش از حد مجاز طولانی است (حداکثر ۷۲ بایت).';
  }
  return null;
}

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

  const handleSave = () => {
    if (!activeLink) {
      const passwordError = validateInvitePassword(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
      saveLinkMutation.mutate(
        { password, maxUses, expiryDate },
        { onSuccess: () => setPassword('') },
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
    const nextMaxUses = maxUsesChanged && maxUses != null ? maxUses : undefined;
    const nextExpiryDate =
      expiryDateChanged && expiryDate ? expiryDate : undefined;

    if (
      nextMaxUses === undefined &&
      nextExpiryDate === undefined &&
      password.length === 0
    ) {
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
        maxUses: nextMaxUses,
        expiryDate: nextExpiryDate,
      },
      { onSuccess: () => setPassword('') },
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
                size="compact"
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
            description="حداقل ۸ کاراکتر (حداکثر ۷۲ بایت)"
            error={
              getUtf8ByteLength(password) > INVITE_PASSWORD_MAX_BYTES
                ? 'رمز عبور بیش از حد مجاز طولانی است (حداکثر ۷۲ بایت).'
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

export function InviteLinkSection() {
  const { group, isOwner } = useGroupSettingsContext();
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
          {getApiErrorMessage(error, {
            fallback: 'دریافت لینک‌های دعوت انجام نشد.',
          })}
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

import { useState, type ReactNode } from 'react';
import { Archive, LogOut, Trash2 } from 'lucide-react';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import {
  useArchiveGroup,
  useDeleteGroup,
  useLeaveGroup,
} from '../../hooks/use-group-settings';
import { useGroupSettingsContext } from './group-settings-context';
import { InlineConfirm } from './GroupSettingsShared';

interface DangerConfirmConfig {
  prompt: string;
  confirmLabel: string;
  loadingLabel: string;
  cancelAriaLabel: string;
}

function useExitOnSuccess() {
  const { close, exitGroup } = useGroupSettingsContext();
  return (resetConfirm: () => void) => ({
    onSuccess: () => {
      resetConfirm();
      close();
      exitGroup?.();
    },
  });
}

function DangerConfirmCard({
  icon,
  title,
  description,
  triggerLabel,
  confirm,
  showAction,
  isLoading,
  onConfirm,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  triggerLabel: string;
  confirm: DangerConfirmConfig;
  showAction: boolean;
  isLoading: boolean;
  onConfirm: (resetConfirm: () => void) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-danger-20 bg-danger-10 p-4 text-danger-50">
      <h4 className="flex items-center gap-1.5 text-paragraph-sm font-bold">
        {icon}
        {title}
      </h4>
      <p className="text-caption leading-relaxed text-danger-50">
        {description}
      </p>
      {showAction && (
        <div className="mt-2 flex items-center">
          {!confirming ? (
            <Button
              type="button"
              size="md"
              radius="lg"
              onClick={() => setConfirming(true)}
              className="bg-danger-40 text-white hover:bg-danger-50 active:bg-danger-60"
            >
              {triggerLabel}
            </Button>
          ) : (
            <InlineConfirm
              prompt={confirm.prompt}
              confirmLabel={confirm.confirmLabel}
              loadingLabel={confirm.loadingLabel}
              cancelAriaLabel={confirm.cancelAriaLabel}
              isLoading={isLoading}
              onConfirm={() => onConfirm(() => setConfirming(false))}
              onCancel={() => setConfirming(false)}
            />
          )}
        </div>
      )}
    </article>
  );
}

function MemberDangerZone() {
  const { group } = useGroupSettingsContext();
  const leaveMutation = useLeaveGroup(group.id);
  const exitOnSuccess = useExitOnSuccess();
  const isClosed = group.status === 'CLOSED';

  return (
    <div className="flex flex-col gap-4">
      <DangerConfirmCard
        icon={<LogOut className="size-4.5 text-danger-40" />}
        title="خروج از اکیپ"
        description={
          isClosed
            ? 'این اکیپ بسته شده و امکان خروج از آن وجود ندارد.'
            : 'با خروج از اکیپ، دسترسی شما به این اکیپ قطع می‌شود و تسویه‌های ورودی در انتظار شما لغو خواهند شد.'
        }
        triggerLabel="خروج از اکیپ"
        confirm={{
          prompt: 'آیا از خروج مطمئنید؟',
          confirmLabel: 'تأیید خروج',
          loadingLabel: 'در حال خروج…',
          cancelAriaLabel: 'لغو خروج از اکیپ',
        }}
        showAction={!isClosed}
        isLoading={leaveMutation.isPending}
        onConfirm={(resetConfirm) =>
          leaveMutation.mutate(undefined, exitOnSuccess(resetConfirm))
        }
      />
    </div>
  );
}

function OwnerDangerZone() {
  const { group } = useGroupSettingsContext();
  const archiveMutation = useArchiveGroup(group.id);
  const deleteMutation = useDeleteGroup(group.id);
  const exitOnSuccess = useExitOnSuccess();
  const isActive = group.status === 'ACTIVE';
  const isClosed = group.status === 'CLOSED';

  return (
    <div className="flex flex-col gap-4">
      <article className="flex flex-col gap-2 rounded-2xl border border-accent-30 bg-accent-10 p-4 text-accent-80">
        <h4 className="flex items-center gap-1.5 text-paragraph-sm font-bold">
          <Archive className="size-4.5 text-accent-70" />
          {isActive ? 'آرشیو کردن اکیپ' : 'وضعیت آرشیو اکیپ'}
        </h4>
        <p className="text-caption leading-relaxed">
          {isActive
            ? 'با وارد کردن اکیپ به حالت تسویه، ثبت هزینه، نظرسنجی و قرعه‌کشی جدید غیرفعال می‌شود؛ تسویه‌ها و مرور تاریخچه همچنان در دسترس می‌مانند. این تغییر یک‌طرفه است.'
            : isClosed
              ? 'این اکیپ آرشیو شده و تمام بخش‌های آن فقط‌خواندنی هستند.'
              : 'این اکیپ در وضعیت «در حال تسویه» قرار دارد. امکان بازگرداندن به حالت فعال وجود ندارد.'}
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

      <DangerConfirmCard
        icon={<Trash2 className="size-4.5 text-danger-40" />}
        title="حذف کامل اکیپ"
        description={
          isClosed
            ? 'اکیپ بسته‌شده قابل حذف نیست.'
            : 'این اقدام قابل بازگشت نیست. اکیپ‌هایی که سابقه تسویه دارند قابل حذف نیستند.'
        }
        triggerLabel="حذف دائم اکیپ"
        confirm={{
          prompt: 'آیا از حذف دائم مطمئنید؟',
          confirmLabel: 'حذف دائم',
          loadingLabel: 'در حال حذف…',
          cancelAriaLabel: 'لغو حذف اکیپ',
        }}
        showAction={!isClosed}
        isLoading={deleteMutation.isPending}
        onConfirm={(resetConfirm) =>
          deleteMutation.mutate(undefined, exitOnSuccess(resetConfirm))
        }
      />
    </div>
  );
}

export function DangerZoneSection() {
  const { isOwner } = useGroupSettingsContext();
  return isOwner ? <OwnerDangerZone /> : <MemberDangerZone />;
}

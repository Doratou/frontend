import { useState } from 'react';
import { Archive, LogOut, Trash2 } from 'lucide-react';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import {
  useArchiveGroup,
  useDeleteGroup,
  useLeaveGroup,
} from '../../hooks/use-group-settings';
import type { GroupSettingsData } from '../../types';
import { InlineConfirm } from './GroupSettingsShared';

export function DangerZoneSection({
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

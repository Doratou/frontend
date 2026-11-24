import { useRef, useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { LoadingButton } from '@/components/custom/loading-button';
import { TextField } from '@/components/custom/text-field';
import { toast } from '@/components/custom/toast';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatNumber } from '@/utils/format';
import {
  GROUP_COVER_MAX_BYTES,
  GROUP_DESCRIPTION_MAX_LENGTH,
  GROUP_STATUS_LABELS,
  GROUP_TITLE_MAX_LENGTH,
} from '../../constants';
import {
  useUpdateGroupCover,
  useUpdateGroupInfo,
} from '../../hooks/use-group-settings';
import type { GroupSettingsData } from '../../types';
import { GroupAvatar } from './GroupSettingsShared';

function OverviewMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-caption text-neutral-60">{label}</dt>
      <dd className="text-paragraph-sm font-bold text-primary-80">{value}</dd>
    </div>
  );
}

function OverviewInfoForm({
  group,
  canEdit,
}: {
  group: GroupSettingsData;
  canEdit: boolean;
}) {
  const updateInfoMutation = useUpdateGroupInfo(group.id);
  const [title, setTitle] = useState(group.title);
  const [description, setDescription] = useState(group.description);

  const hasChanges =
    title.trim() !== group.title.trim() ||
    description.trim() !== group.description.trim();

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle) {
      toast.error('نام اکیپ نمی‌تواند خالی باشد');
      return;
    }
    const payload: { title?: string; description?: string } = {};
    if (trimmedTitle !== group.title.trim()) payload.title = trimmedTitle;
    if (trimmedDescription !== group.description.trim()) {
      payload.description = trimmedDescription;
    }
    if (payload.title === undefined && payload.description === undefined)
      return;
    updateInfoMutation.mutate(payload);
  };

  return (
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
  );
}

export function OverviewSection({
  group,
  isOwner,
  coverSrc,
  onCoverError,
}: {
  group: GroupSettingsData;
  isOwner: boolean;
  coverSrc?: string;
  onCoverError?: () => void;
}) {
  const updateCoverMutation = useUpdateGroupCover(group.id);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const canEdit = isOwner && group.status !== 'CLOSED';

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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <GroupAvatar
            title={group.title}
            src={coverSrc}
            onError={onCoverError}
            className="size-16 text-2xl"
          />
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

      {isOwner && (
        <OverviewInfoForm
          key={`${group.id}-${group.title}-${group.description}`}
          group={group}
          canEdit={canEdit}
        />
      )}

      <dl className="flex flex-col divide-y divide-neutral-20 rounded-2xl border border-neutral-20 bg-white">
        <OverviewMetaRow
          label="وضعیت"
          value={GROUP_STATUS_LABELS[group.status]}
        />
        <OverviewMetaRow
          label="نوع اکیپ"
          value={group.plan === 'PREMIUM' ? 'گروه پریمیوم' : 'گروه عادی'}
        />
        <OverviewMetaRow label="ساخته شده توسط" value={group.creator.name} />
        <OverviewMetaRow label="تاریخ ساخت" value={group.createdDateLabel} />
        <OverviewMetaRow
          label="تعداد اعضا"
          value={`${formatNumber(group.memberCount)} نفر`}
        />
      </dl>
    </div>
  );
}

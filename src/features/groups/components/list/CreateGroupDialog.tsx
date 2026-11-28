import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Camera,
  Check,
  Crown,
  Link2,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFriendsList } from '@/features/groups/hooks/use-group-settings';
import { cn } from '@/lib/utils';

const createGroupSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'نام اکیپ باید حداقل ۲ کاراکتر باشد.')
    .max(150, 'نام اکیپ نباید بیشتر از ۱۵۰ کاراکتر باشد.'),
  description: z
    .string()
    .trim()
    .max(5000, 'توضیحات نباید بیشتر از ۵۰۰۰ کاراکتر باشد.'),
  invitedFriendIds: z.array(z.string()),
});

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

export interface CreateGroupSubmitPayload extends CreateGroupFormValues {
  coverFile?: File;
}

const AVATAR_COLORS = [
  'bg-primary-60',
  'bg-danger-40',
  'bg-warning-50',
  'bg-secondary-70',
  'bg-primary-50',
  'bg-info-50',
];

function getInitial(name: string): string {
  return name.trim().charAt(0) || 'ک';
}

function getAvatarBg(id: string): string {
  const num = Number.parseInt(id, 10);
  const idx = Number.isFinite(num) ? Math.abs(num) % AVATAR_COLORS.length : 0;
  return AVATAR_COLORS[idx] ?? 'bg-primary-60';
}

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<CreateGroupFormValues> | null;
  isCloning?: boolean;
  isPending?: boolean;
  onCreate: (payload: CreateGroupSubmitPayload) => Promise<void> | void;
}

const DEFAULT_VALUES: CreateGroupFormValues = {
  title: '',
  description: '',
  invitedFriendIds: [],
};

export function CreateGroupDialog({
  open,
  onOpenChange,
  initialValues,
  isCloning = false,
  isPending = false,
  onCreate,
}: CreateGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-sm:max-h-[calc(100dvh-1.5rem)] max-sm:w-[calc(100%-1.5rem)]">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-neutral-20 bg-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-70 text-white"
            >
              <Users className="size-5.5" />
            </span>
            <div className="flex min-w-0 flex-col">
              <DialogTitle className="text-heading-5 text-primary-80">
                {isCloning ? 'ساخت اکیپ مشابه' : 'ساخت اکیپ جدید'}
              </DialogTitle>
              <DialogDescription className="text-caption text-neutral-60">
                {isCloning
                  ? 'اعضای اکیپ قبلی به صورت خودکار اضافه می‌شوند'
                  : 'اطلاعات اکیپ را وارد کنید و دوستانتان را دعوت کنید'}
              </DialogDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon-md"
            radius="lg"
            aria-label="بستن"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="border-neutral-30 text-neutral-70"
          >
            <X className="size-4.5" />
          </Button>
        </header>

        {open && (
          <CreateGroupForm
            initialValues={initialValues}
            isCloning={isCloning}
            isPending={isPending}
            onCancel={() => onOpenChange(false)}
            onCreate={async (payload) => {
              await onCreate(payload);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface CreateGroupFormProps {
  initialValues?: Partial<CreateGroupFormValues> | null;
  isCloning: boolean;
  isPending: boolean;
  onCancel: () => void;
  onCreate: (payload: CreateGroupSubmitPayload) => Promise<void>;
}

function CreateGroupForm({
  initialValues,
  isCloning,
  isPending,
  onCancel,
  onCreate,
}: CreateGroupFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(
    undefined,
  );
  const [friendSearch, setFriendSearch] = useState('');

  const { data: friends = [], isLoading: isFriendsLoading } =
    useFriendsList(!isCloning);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      ...initialValues,
    },
  });

  const invitedIds = useWatch({ control, name: 'invitedFriendIds' });

  const filteredFriends = useMemo(() => {
    const q = friendSearch.trim();
    if (!q) return friends;
    return friends.filter((f) => f.name.includes(q));
  }, [friends, friendSearch]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleFriend = (friendId: string) => {
    const next = invitedIds.includes(friendId)
      ? invitedIds.filter((id) => id !== friendId)
      : [...invitedIds, friendId];
    setValue('invitedFriendIds', next);
  };

  const onSubmit = async (values: CreateGroupFormValues) => {
    await onCreate({
      ...values,
      coverFile,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4 overflow-y-auto p-5"
    >
      {/* Row 1: Photo Picker + Group Name */}
      <div className="flex items-start gap-4">
        {!isCloning && (
          <div className="flex shrink-0 flex-col gap-1.5">
            <span className="text-caption font-medium text-primary-80">
              عکس اکیپ
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative grid size-20 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-primary-30 bg-primary-10/40 text-primary-60 transition-colors hover:border-primary-50 hover:bg-primary-10"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="پیش‌نمایش عکس اکیپ"
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex flex-col items-center gap-1">
                  <Camera className="size-5" aria-hidden="true" />
                  <span className="text-[11px] font-medium">افزودن</span>
                </span>
              )}
            </button>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label
            htmlFor="group-title-input"
            className="text-caption font-medium text-primary-80"
          >
            نام اکیپ <span className="text-danger-50">*</span>
          </label>
          <input
            id="group-title-input"
            type="text"
            placeholder="مثلاً: اکیپ سفر شمال ۱۴۰۵"
            aria-invalid={Boolean(errors.title)}
            className={cn(
              'h-11 w-full rounded-xl border bg-white px-3.5 text-paragraph-sm text-foreground transition-colors outline-none placeholder:text-neutral-50 focus:border-primary-60',
              errors.title ? 'border-danger-40' : 'border-neutral-30',
            )}
            {...register('title')}
          />
          {errors.title && (
            <p role="alert" className="text-caption text-danger-50">
              {errors.title.message}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Description */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="group-description-input"
          className="text-caption font-medium text-primary-80"
        >
          توضیحات اکیپ
        </label>
        <textarea
          id="group-description-input"
          rows={3}
          placeholder="درباره‌ی هدف و برنامه‌ی اکیپ بنویسید..."
          aria-invalid={Boolean(errors.description)}
          className={cn(
            'w-full resize-none rounded-2xl border bg-white p-3.5 text-paragraph-sm text-foreground transition-colors outline-none placeholder:text-neutral-50 focus:border-primary-60',
            errors.description ? 'border-danger-40' : 'border-neutral-30',
          )}
          {...register('description')}
        />
        {errors.description && (
          <p role="alert" className="text-caption text-danger-50">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Row 3: Invite Friends (only when creating a brand new group) */}
      {!isCloning && (
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-20 bg-white p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-button-sm font-bold text-primary-80">
              دعوت دوستان
            </span>
            <span className="text-caption text-neutral-60">
              اختیاری؛ بعداً هم می‌توانید دعوت کنید
            </span>
          </div>

          {invitedIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {friends
                .filter((f) => invitedIds.includes(f.id))
                .map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => toggleFriend(friend.id)}
                    className="inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-full border border-primary-30 bg-primary-10/70 pr-1 pl-2.5 text-caption font-medium text-primary-80 transition-colors hover:bg-primary-20/70"
                  >
                    <span
                      className={cn(
                        'grid size-5.5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white',
                        getAvatarBg(friend.id),
                      )}
                    >
                      {getInitial(friend.name)}
                    </span>
                    <span>{friend.name.split(' ')[0]}</span>
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                ))}
            </div>
          )}

          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-50"
              aria-hidden="true"
            />
            <input
              type="text"
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              placeholder="جستجوی دوستان..."
              className="h-10 w-full rounded-xl border border-neutral-20 bg-neutral-10/60 pr-9 pl-3 text-caption text-foreground outline-none placeholder:text-neutral-50 focus:border-primary-50 focus:bg-white"
            />
          </div>

          {isFriendsLoading ? (
            <p className="py-2 text-center text-caption text-neutral-60">
              در حال بارگذاری لیست دوستان...
            </p>
          ) : filteredFriends.length > 0 ? (
            <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {filteredFriends.map((friend) => {
                const selected = invitedIds.includes(friend.id);
                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => toggleFriend(friend.id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 text-right transition-colors',
                      selected
                        ? 'border-primary-50 bg-primary-10/70'
                        : 'border-neutral-20 bg-white hover:bg-neutral-10',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {friend.avatarSrc ? (
                        <img
                          src={friend.avatarSrc}
                          alt={friend.name}
                          className="size-7 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span
                          className={cn(
                            'grid size-7 shrink-0 place-items-center rounded-full text-caption font-bold text-white',
                            getAvatarBg(friend.id),
                          )}
                        >
                          {getInitial(friend.name)}
                        </span>
                      )}
                      <span className="truncate text-caption font-medium text-primary-80">
                        {friend.name}
                      </span>
                    </div>

                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid size-4.5 shrink-0 place-items-center rounded-md border transition-colors',
                        selected
                          ? 'border-primary-70 bg-primary-70 text-white'
                          : 'border-neutral-30 bg-white',
                      )}
                    >
                      {selected && <Check className="size-3 stroke-[2.5]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="py-2 text-center text-caption text-neutral-60">
              {friendSearch.trim()
                ? 'دوستی با این نام پیدا نشد.'
                : 'هنوز دوستی برای دعوت وجود ندارد.'}
            </p>
          )}

          <div className="flex items-center gap-2 rounded-xl bg-primary-10/70 px-3 py-2 text-caption text-neutral-70">
            <Link2
              className="size-4 shrink-0 text-primary-60"
              aria-hidden="true"
            />
            <span>
              برای دعوت با لینک، بعد از ساخت اکیپ به «تنظیمات اکیپ» بروید و لینک
              دعوت بسازید.
            </span>
          </div>
        </div>
      )}

      {/* Row 4: Premium Info Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-accent-30 bg-accent-10/70 p-3.5">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-20/70 text-accent-60"
        >
          <Crown className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-button-sm font-bold text-primary-80">
            ارتقا به اکیپ پریمیوم
          </p>
          <p className="text-caption leading-5 text-accent-80">
            پس از ساخت اکیپ، می‌توانید در هر زمان از داخل گروه (بخش تنظیمات یا
            هدر اکیپ) آن را به نسخهٔ پریمیوم ارتقا دهید.
          </p>
        </div>
      </div>

      <p className="text-caption text-neutral-60">
        <span className="text-danger-50">*</span> فیلدهای ستاره‌دار الزامی هستند
      </p>

      {/* Footer Buttons */}
      <div className="flex items-center gap-2.5 pt-1">
        <LoadingButton
          type="submit"
          tone="primary"
          size="lg"
          radius="lg"
          isLoading={isPending}
          loadingText="در حال ساخت..."
          startIcon={<Plus className="size-4" aria-hidden="true" />}
          className="flex-1 justify-center"
        >
          {isCloning ? 'ساخت اکیپ مشابه' : 'ساخت اکیپ'}
        </LoadingButton>
        <Button
          type="button"
          variant="outline"
          tone="primary"
          size="lg"
          radius="lg"
          disabled={isPending}
          onClick={onCancel}
          className="border-neutral-30 px-6 text-neutral-70"
        >
          انصراف
        </Button>
      </div>
    </form>
  );
}

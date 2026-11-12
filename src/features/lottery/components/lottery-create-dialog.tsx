import { Dialog } from '@base-ui/react/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  LOTTERY_MAX_PARTICIPANTS,
  LOTTERY_TITLE_MAX_LENGTH,
} from '@/features/lottery/config';
import { toPersianNumber } from '@/features/lottery/format';
import { useCreateLottery } from '@/features/lottery/hooks/use-create-lottery';
import { ParticipantAvatar } from '@/features/lottery/components/participant-avatar';
import {
  createLotterySchema,
  type CreateLotteryFormValues,
} from '@/features/lottery/schemas';
import type { Lottery, LotteryParticipant } from '@/features/lottery/types';

interface LotteryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: LotteryParticipant[];
  onCreated?: (lottery: Lottery) => void;
}

export function LotteryCreateDialog({
  open,
  onOpenChange,
  groupId,
  members,
  onCreated,
}: LotteryCreateDialogProps) {
  const createLottery = useCreateLottery(groupId);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateLotteryFormValues>({
    resolver: zodResolver(createLotterySchema),
    defaultValues: { title: '', participantIds: [] },
  });
  const selectedIds = useWatch({ control, name: 'participantIds' });

  const selectableCount = Math.min(members.length, LOTTERY_MAX_PARTICIPANTS);
  const allSelected = selectedIds.length === selectableCount;

  const setSelection = (ids: string[]) =>
    setValue('participantIds', ids, { shouldValidate: true, shouldDirty: true });

  const toggleMember = (id: string) =>
    setSelection(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );

  const toggleAll = () =>
    setSelection(
      allSelected
        ? []
        : members.slice(0, LOTTERY_MAX_PARTICIPANTS).map((member) => member.id),
    );

  const handleOpenChange = (next: boolean) => {
    // Participants are defined per lottery, so a closed dialog always starts clean.
    if (!next) reset();
    onOpenChange(next);
  };

  const onSubmit = (values: CreateLotteryFormValues) => {
    createLottery.mutate(values, {
      onSuccess: (lottery) => {
        reset();
        onOpenChange(false);
        onCreated?.(lottery);
      },
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral-80/50 backdrop-blur-sm" />
        <Dialog.Popup
          dir="rtl"
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[90dvh] w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-hidden rounded-3xl border bg-card p-6 text-card-foreground shadow-xl outline-none"
        >
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-heading-4">
              قرعه‌کشی جدید
            </Dialog.Title>
            <Dialog.Description className="text-paragraph-sm text-muted-foreground">
              عنوان را بنویس و کسانی را که در این قرعه‌کشی شرکت دارند انتخاب کن.
            </Dialog.Description>
          </div>

          <form
            noValidate
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event);
            }}
            className="flex min-h-0 flex-1 flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="lottery-title" className="text-heading-mobile-6">
                عنوان
              </label>
              <Input
                id="lottery-title"
                autoComplete="off"
                maxLength={LOTTERY_TITLE_MAX_LENGTH}
                placeholder="مثلاً: کی شام رو حساب کنه؟"
                aria-invalid={errors.title ? true : undefined}
                {...register('title')}
              />
              {errors.title && (
                <p role="alert" className="text-caption text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <fieldset className="flex min-h-0 flex-1 flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <legend className="text-heading-mobile-6">
                  شرکت‌کننده‌ها ({toPersianNumber(selectedIds.length)} از{' '}
                  {toPersianNumber(members.length)})
                </legend>
                <Button
                  variant="link"
                  size="md"
                  onClick={toggleAll}
                  className="px-0"
                >
                  {allSelected ? 'برداشتن همه' : 'انتخاب همه'}
                </Button>
              </div>

              <ul className="flex min-h-0 flex-col gap-2 overflow-y-auto pe-1">
                {members.map((member) => {
                  const checked = selectedIds.includes(member.id);
                  const disabled =
                    !checked && selectedIds.length >= LOTTERY_MAX_PARTICIPANTS;
                  return (
                    <li key={member.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:outline-2 has-focus-visible:outline-ring has-disabled:cursor-not-allowed has-disabled:opacity-50">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleMember(member.id)}
                        />
                        <ParticipantAvatar participant={member} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-paragraph-sm">
                          {member.name}
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            'grid size-5 place-items-center rounded-full border',
                            checked &&
                              'border-primary bg-primary text-primary-foreground',
                          )}
                        >
                          {checked && <Check className="size-3.5" />}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>

              {errors.participantIds && (
                <p role="alert" className="text-caption text-destructive">
                  {errors.participantIds.message}
                </p>
              )}
            </fieldset>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleOpenChange(false)}
              >
                انصراف
              </Button>
              <LoadingButton
                type="submit"
                size="lg"
                isLoading={createLottery.isPending}
                loadingText="در حال ساخت…"
              >
                ساخت قرعه‌کشی
              </LoadingButton>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

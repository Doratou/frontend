import { useMemo } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderPinwheel, Plus, X } from 'lucide-react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  LOTTERY_MAX_OPTIONS,
  LOTTERY_TITLE_MAX_LENGTH,
} from '@/features/lottery/config';
import { toPersianNumber } from '@/features/lottery/format';
import { useCreateLottery } from '@/features/lottery/hooks/use-create-lottery';
import { CreateCustomOption } from '@/features/lottery/components/create-custom-option';
import { CreateMembersPicker } from '@/features/lottery/components/create-members-picker';
import { CreateModeSwitch } from '@/features/lottery/components/create-mode-switch';
import {
  CreateOptionsList,
  type OptionRow,
} from '@/features/lottery/components/create-options-list';
import {
  createLotterySchema,
  type CreateLotteryFormValues,
} from '@/features/lottery/schemas';
import type {
  Lottery,
  LotteryMember,
  LotteryMode,
} from '@/features/lottery/types';
import { withEvenWeights } from '@/features/lottery/utils';

type OptionValue = CreateLotteryFormValues['options'][number];

interface LotteryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: LotteryMember[];
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
    defaultValues: { title: '', mode: 'equal', options: [] },
  });
  const { fields, replace } = useFieldArray({ control, name: 'options' });
  const options = useWatch({ control, name: 'options' });
  const mode = useWatch({ control, name: 'mode' });

  const selectedMemberIds = useMemo(
    () =>
      new Set(
        options.flatMap((option) => (option.memberId ? [option.memberId] : [])),
      ),
    [options],
  );

  const rows: OptionRow[] = fields.map((field, index) => ({
    key: field.id,
    index,
    label: field.label,
    member: members.find((member) => member.id === field.memberId) ?? null,
  }));

  // Every structural change goes through `replace`, so the weighted mode can
  // re-split the percentages evenly and the total always stays valid.
  const updateOptions = (next: OptionValue[]) =>
    replace(mode === 'weighted' ? withEvenWeights(next) : next);

  const toggleMember = (member: LotteryMember) => {
    updateOptions(
      selectedMemberIds.has(member.id)
        ? options.filter((option) => option.memberId !== member.id)
        : [...options, { memberId: member.id, label: member.name, weight: 0 }],
    );
  };

  const addCustomOption = (label: string): string | null => {
    if (options.length >= LOTTERY_MAX_OPTIONS) {
      return `حداکثر ${toPersianNumber(LOTTERY_MAX_OPTIONS)} گزینه مجاز است.`;
    }
    const exists = options.some(
      (option) => option.label.trim().toLowerCase() === label.toLowerCase(),
    );
    if (exists) return 'این گزینه قبلاً اضافه شده است.';
    updateOptions([...options, { memberId: null, label, weight: 0 }]);
    return null;
  };

  const removeOption = (index: number) =>
    updateOptions(options.filter((_, position) => position !== index));

  const changeMode = (next: LotteryMode) => {
    setValue('mode', next, { shouldDirty: true });
    // Start every mode from an even split, so no stale or empty weight survives.
    replace(withEvenWeights(options));
  };

  const handleOpenChange = (next: boolean) => {
    // Options are defined per lottery, so a closed dialog always starts clean.
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
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[92dvh] w-[min(94vw,36rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-xl outline-none"
        >
          <header className="flex items-center gap-3 border-b bg-muted/60 p-4">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-70 text-white"
            >
              <LoaderPinwheel className="size-6" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <Dialog.Title className="text-heading-5">
                قرعه‌کشی جدید
              </Dialog.Title>
              <Dialog.Description className="text-caption text-muted-foreground">
                گزینه‌ها و نوع قرعه‌کشی را تنظیم کنید
              </Dialog.Description>
            </div>
            <Button
              variant="outline"
              size="icon-md"
              radius="md"
              aria-label="بستن"
              className="size-9"
              onClick={() => handleOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </header>

          <form
            noValidate
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event);
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-5">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="lottery-title"
                  className="text-heading-mobile-6"
                >
                  عنوان قرعه‌کشی
                </label>
                <Input
                  id="lottery-title"
                  autoComplete="off"
                  maxLength={LOTTERY_TITLE_MAX_LENGTH}
                  placeholder="مثلاً: امشب کجا شام بخوریم؟"
                  aria-invalid={errors.title ? true : undefined}
                  {...register('title')}
                />
                {errors.title && (
                  <p role="alert" className="text-caption text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="border-t pt-5">
                <CreateMembersPicker
                  members={members}
                  selectedMemberIds={selectedMemberIds}
                  isFull={options.length >= LOTTERY_MAX_OPTIONS}
                  onToggle={toggleMember}
                />
              </div>

              <div className="border-t pt-5">
                <CreateCustomOption onAdd={addCustomOption} />
              </div>

              <div className="border-t pt-5">
                <CreateModeSwitch value={mode} onChange={changeMode} />
              </div>

              <div className="border-t pt-5">
                <CreateOptionsList
                  mode={mode}
                  rows={rows}
                  weights={options.map((option) => option.weight)}
                  register={register}
                  errors={errors}
                  onRemove={removeOption}
                />
              </div>
            </div>

            <footer className="flex gap-2 border-t p-4">
              <Button
                type="submit"
                size="lg"
                radius="lg"
                className="flex-1"
                disabled={createLottery.isPending}
                endIcon={<Plus />}
              >
                {createLottery.isPending ? 'در حال ساخت…' : 'افزودن قرعه‌کشی'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                radius="lg"
                onClick={() => handleOpenChange(false)}
              >
                انصراف
              </Button>
            </footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

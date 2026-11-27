import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderPinwheel, Plus } from 'lucide-react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { DialogTitleBar } from '@/components/custom/dialog-title-bar';
import { TextField } from '@/components/custom/text-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  LOTTERY_MAX_OPTIONS,
  LOTTERY_TITLE_MAX_LENGTH,
} from '@/features/lottery/config';
import { emptyLotteryDraft, type LotteryDraft } from '@/features/lottery/draft';
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
import { getLastWeight, withEvenWeights } from '@/features/lottery/utils';

type OptionValue = CreateLotteryFormValues['options'][number];

interface LotteryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: LotteryMember[];
  membersStatus: 'pending' | 'error' | 'success';
  onCreated?: (lottery: Lottery) => void;
  // Values the form starts with the first time it is shown (for example a lottery
  // built from a poll). Closing the dialog always clears the form afterwards.
  draft?: LotteryDraft | null;
}

export function LotteryCreateDialog({
  open,
  onOpenChange,
  groupId,
  members,
  membersStatus,
  onCreated,
  draft = null,
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
    defaultValues: draft ?? emptyLotteryDraft(),
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

  // Selects every member that is not an option yet, as far as the option limit
  // allows; when all of them are selected it removes them again. Custom options
  // are never touched.
  const allMembersSelected =
    members.length > 0 &&
    members.every((member) => selectedMemberIds.has(member.id));

  const toggleAllMembers = () => {
    if (allMembersSelected) {
      updateOptions(options.filter((option) => option.memberId === null));
      return;
    }
    const room = Math.max(0, LOTTERY_MAX_OPTIONS - options.length);
    const missing = members
      .filter((member) => !selectedMemberIds.has(member.id))
      .slice(0, room);
    updateOptions([
      ...options,
      ...missing.map((member) => ({
        memberId: member.id,
        label: member.name,
        weight: 0,
      })),
    ]);
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
    // Options are defined per lottery, so a closed dialog always starts clean
    // (an initial draft is only used the first time).
    if (!next) reset(emptyLotteryDraft());
    onOpenChange(next);
  };

  const onSubmit = (values: CreateLotteryFormValues) => {
    createLottery.mutate(values, {
      onSuccess: (lottery) => {
        reset(emptyLotteryDraft());
        onOpenChange(false);
        onCreated?.(lottery);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitleBar
          icon={<LoaderPinwheel className="size-6" />}
          title="قرعه‌کشی جدید"
          description="گزینه‌ها و نوع قرعه‌کشی را تنظیم کنید"
          tone="primary"
          onClose={() => handleOpenChange(false)}
        />

        <form
          noValidate
          onSubmit={(event) => {
            // The last weighted option is calculated, so its value is stored
            // right before the form is validated.
            if (mode === 'weighted' && options.length > 0) {
              setValue(
                `options.${options.length - 1}.weight`,
                getLastWeight(options.map((option) => option.weight)),
              );
            }
            void handleSubmit(onSubmit)(event);
          }}
          className="flex flex-col"
        >
          <div className="flex max-h-[60dvh] flex-col gap-5 overflow-y-auto p-4 sm:p-5">
            <TextField
              label="عنوان قرعه‌کشی"
              autoComplete="off"
              maxLength={LOTTERY_TITLE_MAX_LENGTH}
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="border-t pt-5">
              <CreateMembersPicker
                members={members}
                status={membersStatus}
                selectedMemberIds={selectedMemberIds}
                isFull={options.length >= LOTTERY_MAX_OPTIONS}
                allSelected={allMembersSelected}
                onToggle={toggleMember}
                onToggleAll={toggleAllMembers}
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
              className="flex-1"
              disabled={createLottery.isPending}
              endIcon={<Plus className="size-4" />}
            >
              {createLottery.isPending ? 'در حال ساخت…' : 'افزودن قرعه‌کشی'}
            </Button>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              انصراف
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}

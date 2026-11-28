import { useId } from 'react';
import {
  useController,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  ListChecks,
  Plus,
  Send,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { LoadingButton } from '@/components/custom/loading-button';
import { TextField } from '@/components/custom/text-field';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  MAX_OPTION_LENGTH,
  MAX_POLL_OPTIONS,
  MAX_QUESTION_LENGTH,
  MIN_POLL_OPTIONS,
} from '@/features/poll/config';
import { useCreatePoll } from '@/features/poll/hooks/use-create-poll';
import { useGroupId } from '@/features/groups/hooks/use-group-id';
import {
  createPollSchema,
  type CreatePollFormValues,
} from '@/features/poll/schemas';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';

// Option counters only appear once the text gets close to the limit, so rows stay clean.
const OPTION_COUNTER_THRESHOLD = Math.ceil(MAX_OPTION_LENGTH * 0.8);

function CharCounter({ length, max }: { length: number; max: number }) {
  const isFull = length >= max;
  return (
    <span className={cn('block text-end', isFull && 'text-destructive')}>
      {formatNumber(length)} / {formatNumber(max)}
      {isFull && (
        <span role="status" className="sr-only">
          به حداکثر تعداد کاراکتر رسیده‌اید
        </span>
      )}
    </span>
  );
}

function SettingSwitchCard({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-20 p-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary-10 text-secondary-70"
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p id={id} className="text-button-sm font-bold">
          {title}
        </p>
        <p id={`${id}-description`} className="text-caption text-neutral-60">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-labelledby={id}
        aria-describedby={`${id}-description`}
      />
    </div>
  );
}

export function CreatePollForm({ onDone }: { onDone: () => void }) {
  const groupId = useGroupId();
  const createPoll = useCreatePoll(groupId);
  const baseId = useId();
  const optionsHeadingId = `${baseId}-options`;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      question: '',
      options: [{ text: '' }, { text: '' }],
      isAnonymous: true,
      allowMultiple: false,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });
  const { field: anonymousField } = useController({
    control,
    name: 'isAnonymous',
  });
  const { field: multipleField } = useController({
    control,
    name: 'allowMultiple',
  });
  const question = useWatch({ control, name: 'question' });
  const optionValues = useWatch({ control, name: 'options' });

  // Eye with a slash means identities are hidden; a plain eye means they are visible.
  const AnonymousIcon = anonymousField.value ? EyeOff : Eye;

  const onSubmit = handleSubmit((values) => {
    createPoll.mutate(
      {
        question: values.question,
        options: values.options.map((option) => option.text),
        isAnonymous: values.isAnonymous,
        allowMultiple: values.allowMultiple,
      },
      { onSuccess: onDone },
    );
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex flex-col gap-5 overflow-y-auto p-4 sm:p-5">
        <TextField
          label="سوال نظرسنجی"
          fieldSize="lg"
          autoComplete="off"
          maxLength={MAX_QUESTION_LENGTH}
          error={errors.question?.message}
          description={
            <CharCounter length={question.length} max={MAX_QUESTION_LENGTH} />
          }
          {...register('question')}
        />

        <section
          aria-labelledby={optionsHeadingId}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 id={optionsHeadingId} className="text-button-sm">
              گزینه‌ها
            </h3>
            <span className="rounded-full border border-primary-20 bg-primary-10 px-2.5 py-0.5 text-caption text-primary-60">
              حداقل {formatNumber(MIN_POLL_OPTIONS)} گزینه
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-primary-20 bg-primary-10/60 p-3">
            <ul className="flex flex-col gap-2.5">
              {fields.map((field, index) => {
                const number = formatNumber(index + 1);
                const length = optionValues[index]?.text.length ?? 0;
                return (
                  <li key={field.id} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-1.25 grid size-7 shrink-0 place-items-center rounded-full border border-primary-30 bg-primary-10 text-caption text-primary-60"
                    >
                      {number}
                    </span>
                    <TextField
                      label={`گزینه ${number}`}
                      autoComplete="off"
                      maxLength={MAX_OPTION_LENGTH}
                      containerClassName="flex-1"
                      error={errors.options?.[index]?.text?.message}
                      description={
                        length >= OPTION_COUNTER_THRESHOLD ? (
                          <CharCounter
                            length={length}
                            max={MAX_OPTION_LENGTH}
                          />
                        ) : undefined
                      }
                      {...register(`options.${index}.text`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-md"
                      aria-label={`حذف گزینه ${number}`}
                      disabled={fields.length <= MIN_POLL_OPTIONS}
                      onClick={() => remove(index)}
                      className="mt-0.5 text-neutral-60"
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </li>
                );
              })}
            </ul>

            {/* At the limit the button gives way to a note; it returns when an option is removed. */}
            {fields.length < MAX_POLL_OPTIONS ? (
              <Button
                type="button"
                variant="outline"
                radius="md"
                endIcon={<Plus className="size-5" />}
                onClick={() => append({ text: '' })}
                className="self-center"
              >
                افزودن گزینه‌ی جدید
              </Button>
            ) : (
              <p
                role="status"
                className="text-center text-caption text-neutral-60"
              >
                حداکثر {formatNumber(MAX_POLL_OPTIONS)} گزینه می‌توانید اضافه
                کنید
              </p>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <SettingSwitchCard
            icon={AnonymousIcon}
            title="نظرسنجی ناشناس"
            description={
              anonymousField.value
                ? 'هویت رأی‌دهندگان برای دیگران نمایش داده نمی‌شود'
                : 'هویت رأی‌دهندگان برای دیگران نمایش داده می‌شود'
            }
            checked={anonymousField.value}
            onCheckedChange={anonymousField.onChange}
          />
          <SettingSwitchCard
            icon={ListChecks}
            title="چندگزینه‌ای"
            description={
              multipleField.value
                ? 'هر نفر می‌تواند چند گزینه را انتخاب کند'
                : 'هر نفر فقط یک گزینه را می‌تواند انتخاب کند'
            }
            checked={multipleField.value}
            onCheckedChange={multipleField.onChange}
          />
          <p className="text-caption text-neutral-60">
            نوع رأی‌دهی و ناشناس بودن بعد از ساخت قابل تغییر نیستند.
          </p>
        </div>
      </div>

      <footer className="flex items-center gap-3 border-t border-neutral-20 p-4">
        <LoadingButton
          type="submit"
          tone="secondary"
          size="lg"
          isLoading={createPoll.isPending}
          loadingText="در حال ساخت…"
          endIcon={<Send className="size-5 -scale-x-100" />}
          className="flex-1"
        >
          ایجاد نظرسنجی
        </LoadingButton>
        <Button type="button" variant="outline" size="lg" onClick={onDone}>
          انصراف
        </Button>
      </footer>
    </form>
  );
}

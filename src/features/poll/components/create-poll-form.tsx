import { useId } from 'react';
import {
  useController,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Plus, Send, Trash2 } from 'lucide-react';
import { FormField } from '@/components/custom/form-field';
import { LoadingButton } from '@/components/custom/loading-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  MAX_OPTION_LENGTH,
  MAX_POLL_OPTIONS,
  MAX_QUESTION_LENGTH,
  MIN_POLL_OPTIONS,
} from '@/features/poll/config';
import { useCreatePoll } from '@/features/poll/hooks/use-create-poll';
import { useCurrentGroupId } from '@/features/poll/hooks/use-current-group-id';
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

export function CreatePollForm({ onDone }: { onDone: () => void }) {
  const groupId = useCurrentGroupId();
  const createPoll = useCreatePoll(groupId);
  const baseId = useId();
  const optionsHeadingId = `${baseId}-options`;
  const anonymousId = `${baseId}-anonymous`;

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
        <FormField
          label="سوال نظرسنجی"
          error={errors.question?.message}
          description={
            <CharCounter length={question.length} max={MAX_QUESTION_LENGTH} />
          }
        >
          <Input
            placeholder="ود را بنویسید"
            autoComplete="off"
            maxLength={MAX_QUESTION_LENGTH}
            className="border-primary-50"
            {...register('question')}
          />
        </FormField>

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
                      className="mt-1.5 grid size-7 shrink-0 place-items-center rounded-full border border-primary-30 bg-primary-10 text-caption text-primary-60"
                    >
                      {number}
                    </span>
                    <FormField
                      className="flex-1"
                      error={errors.options?.[index]?.text?.message}
                      description={
                        length >= OPTION_COUNTER_THRESHOLD ? (
                          <CharCounter
                            length={length}
                            max={MAX_OPTION_LENGTH}
                          />
                        ) : undefined
                      }
                    >
                      <Input
                        aria-label={`گزینه ${number}`}
                        placeholder={`گزینه ${number}`}
                        autoComplete="off"
                        maxLength={MAX_OPTION_LENGTH}
                        className="border-primary-50"
                        {...register(`options.${index}.text`)}
                      />
                    </FormField>
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

            <Button
              type="button"
              variant="outline"
              radius="md"
              disabled={fields.length >= MAX_POLL_OPTIONS}
              endIcon={<Plus className="size-5" />}
              onClick={() => append({ text: '' })}
              className="self-center"
            >
              افزودن گزینه‌ی جدید
            </Button>
          </div>
        </section>

        <div className="flex items-center gap-3 rounded-xl border border-neutral-20 p-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary-10 text-secondary-70"
          >
            <AnonymousIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p id={anonymousId} className="text-button-sm font-bold">
              نظرسنجی ناشناس
            </p>
            <p
              id={`${anonymousId}-description`}
              className="text-caption text-neutral-60"
            >
              {anonymousField.value
                ? 'هویت رأی‌دهندگان برای دیگران نمایش داده نمی‌شود'
                : 'هویت رأی‌دهندگان برای دیگران نمایش داده می‌شود'}
            </p>
          </div>
          <Switch
            checked={anonymousField.value}
            onCheckedChange={anonymousField.onChange}
            aria-labelledby={anonymousId}
            aria-describedby={`${anonymousId}-description`}
          />
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

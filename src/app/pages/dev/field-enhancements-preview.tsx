import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { NumberField } from '@/components/custom/number-field';
import {
  PersianDatePicker,
  PersianTimePicker,
  PersianDateTimePicker,
} from '@/components/custom/persian-picker';
import { toast } from '@/components/custom/toast';

type PreviewValues = {
  count: number | null;
  date: string | null;
  time: string | null;
  dateTime: string | null;
};

const dialogClassName =
  'm-auto max-h-[calc(100dvh_-_28px)] w-[min(520px,calc(100%_-_28px))] overflow-y-auto rounded-[18px] border border-border bg-card p-6 text-foreground backdrop:bg-primary-80/35';

export function FieldEnhancementsPreview() {
  const form = useForm<PreviewValues>({
    defaultValues: {
      count: 3,
      date: '2026-03-21',
      time: '09:30',
      dateTime: '2026-03-21T06:00:00.000Z',
    },
  });
  const [submitted, setSubmitted] = useState<PreviewValues | null>(null);
  const [modalDate, setModalDate] = useState<string | null>(
    '2026-03-21T06:00:00.000Z',
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const nested = useRef<HTMLDialogElement>(null);
  return (
    <section
      className="space-y-6 rounded-2xl border bg-card p-5 sm:p-6 lg:col-span-2"
      aria-labelledby="advanced-fields-heading"
    >
      <div className="space-y-2">
        <h2 id="advanced-fields-heading" className="text-heading-4">
          عدد، تاریخ و ساعت شمسی
        </h2>
        <p className="text-paragraph-sm leading-7 text-muted-foreground">
          مقادیر نمونه‌اند. تاریخ را با ارقام فارسی یا انگلیسی بنویسید یا از
          انتخابگر استفاده کنید.
        </p>
      </div>
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit((values) => {
          setSubmitted(values);
          toast.success('فرم نمونه معتبر است');
        })}
      >
        <div className="grid gap-7 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="count"
            rules={{
              required: 'تعداد را وارد کنید.',
              min: { value: 1, message: 'حداقل یک نفر.' },
              max: { value: 20, message: 'حداکثر ۲۰ نفر.' },
            }}
            render={({ field, fieldState }) => (
              <NumberField
                label="تعداد اعضا"
                value={field.value}
                onValueChange={field.onChange}
                inputRef={field.ref}
                onBlur={field.onBlur}
                name={field.name}
                min={1}
                max={20}
                step={1}
                required
                error={fieldState.error?.message}
                description="بین ۱ و ۲۰ نفر؛ با دکمه‌ها یا کلیدهای بالا و پایین."
              />
            )}
          />
          <Controller
            control={form.control}
            name="date"
            rules={{ required: 'تاریخ را انتخاب کنید.' }}
            render={({ field, fieldState }) => (
              <PersianDatePicker
                {...field}
                label="تاریخ برنامه"
                onValueChange={field.onChange}
                min="2026-03-21"
                max="2027-03-20"
                disabledDates={['2026-03-25']}
                required
                error={fieldState.error?.message}
                description="سال ۱۴۰۵؛ پنجم فروردین به‌عنوان محدودیت نمونه بسته است."
              />
            )}
          />
          <Controller
            control={form.control}
            name="time"
            rules={{ required: 'ساعت را انتخاب کنید.' }}
            render={({ field, fieldState }) => (
              <PersianTimePicker
                {...field}
                label="ساعت شروع"
                onValueChange={field.onChange}
                required
                error={fieldState.error?.message}
                description="قالب ۲۴ ساعته؛ ساعت و دقیقه."
              />
            )}
          />
          <Controller
            control={form.control}
            name="dateTime"
            rules={{ required: 'زمان را انتخاب کنید.' }}
            render={({ field, fieldState }) => (
              <PersianDateTimePicker
                {...field}
                label="مهلت ثبت‌نام"
                onValueChange={field.onChange}
                required
                error={fieldState.error?.message}
                description="انتخاب به وقت ایران؛ ارسال به API به‌صورت ISO و UTC."
              />
            )}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" radius="md">
            بررسی و نمایش خروجی
          </Button>
          <Button
            variant="outline"
            size="lg"
            radius="md"
            onClick={() => {
              form.reset();
              setSubmitted(null);
            }}
          >
            بازنشانی
          </Button>
          <Button
            variant="outline"
            size="lg"
            radius="md"
            onClick={() => dialog.current?.showModal()}
          >
            تست داخل پنل
          </Button>
        </div>
        {submitted && (
          <pre
            dir="ltr"
            className="overflow-auto rounded-lg bg-muted p-4 text-left text-caption"
          >
            {JSON.stringify(submitted, null, 2)}
          </pre>
        )}
      </form>
      <div className="grid gap-5 sm:grid-cols-2">
        <PersianDatePicker
          label="تاریخ غیرفعال"
          value="2026-03-21"
          onValueChange={() => {}}
          disabled
        />
        <NumberField
          label="عدد دارای خطا"
          defaultValue={0}
          error="مقدار باید بیشتر از صفر باشد."
          min={1}
        />
      </div>
      <dialog
        ref={dialog}
        className={dialogClassName}
        aria-labelledby="field-preview-dialog-title"
      >
        <h3 id="field-preview-dialog-title" className="mb-6 text-heading-5">
          انتخابگر و اعلان داخل پنل
        </h3>
        <PersianDateTimePicker
          label="تاریخ و ساعت داخل پنل"
          value={modalDate}
          onValueChange={setModalDate}
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            size="lg"
            radius="md"
            onClick={() => toast.success('سارا محمدی از پیش‌نمایش حذف شد.')}
          >
            نمایش اعلان روی پنل
          </Button>
          <Button
            variant="outline"
            size="lg"
            radius="md"
            onClick={() => nested.current?.showModal()}
          >
            پنل تو‌در‌تو
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => dialog.current?.close()}
          >
            بستن پنل
          </Button>
        </div>
        <dialog ref={nested} className={dialogClassName} aria-label="پنل دوم">
          <p className="mb-5 text-heading-6">پنل دوم</p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => toast.success('اعلان روی پنل دوم نمایش داده شد.')}
            >
              اعلان پنل دوم
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => nested.current?.close()}
            >
              بستن پنل دوم
            </Button>
          </div>
        </dialog>
      </dialog>
    </section>
  );
}

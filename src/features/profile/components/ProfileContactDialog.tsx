import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { TextField } from '@/components/custom/text-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  emailFormSchema,
  phoneFormSchema,
  type ContactFormValues,
} from '../schemas';
import type { ContactDialogField } from '../types';

export interface ProfileContactDialogProps {
  field: ContactDialogField | null;
  currentValue?: string | null;
  onClose: () => void;
  onSave: (field: ContactDialogField, value: string) => void;
}

const DIALOG_META: Record<
  ContactDialogField,
  {
    titleCreate: string;
    titleEdit: string;
    description: string;
    label: string;
    placeholder: string;
    type: 'email' | 'tel';
    inputMode: 'email' | 'tel';
    autoComplete: string;
  }
> = {
  email: {
    titleCreate: 'ثبت ایمیل',
    titleEdit: 'تغییر ایمیل',
    description:
      'آدرس ایمیل معتبر خود را برای دریافت اعلان‌ها و بازیابی حساب وارد کنید.',
    label: 'ایمیل',
    placeholder: 'name@example.com',
    type: 'email',
    inputMode: 'email',
    autoComplete: 'email',
  },
  phone: {
    titleCreate: 'ثبت شماره تلفن',
    titleEdit: 'تغییر شماره تلفن',
    description: 'شماره موبایل ۱۱ رقمی خود را با پیش‌شماره ۰۹ وارد کنید.',
    label: 'شماره تلفن',
    placeholder: '09121234567',
    type: 'tel',
    inputMode: 'tel',
    autoComplete: 'tel',
  },
};

export function ProfileContactDialog({
  field,
  currentValue,
  onClose,
  onSave,
}: ProfileContactDialogProps) {
  const activeField = field ?? 'email';
  const meta = DIALOG_META[activeField];
  const hasExisting = Boolean(currentValue?.trim());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(
      activeField === 'email' ? emailFormSchema : phoneFormSchema,
    ),
    defaultValues: { value: currentValue ?? '' },
  });

  useEffect(() => {
    if (field) {
      reset({ value: currentValue ?? '' });
    }
  }, [field, currentValue, reset]);

  const onSubmit = (data: ContactFormValues) => {
    if (!field) return;
    onSave(field, data.value);
    onClose();
  };

  return (
    <Dialog open={field !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-primary-20/70 px-5 py-4 dark:border-border">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-heading-5 text-primary-80 dark:text-foreground">
              {hasExisting ? meta.titleEdit : meta.titleCreate}
            </DialogTitle>
            <DialogDescription className="text-caption text-neutral-70 dark:text-muted-foreground">
              {meta.description}
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            onClick={onClose}
            aria-label="بستن پنجره"
            className="size-8 shrink-0 rounded-lg text-neutral-60 hover:text-neutral-80 dark:text-muted-foreground"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 overflow-y-auto overscroll-contain p-5"
        >
          <TextField
            {...register('value')}
            label={meta.label}
            type={meta.type}
            inputMode={meta.inputMode}
            autoComplete={meta.autoComplete}
            placeholder={meta.placeholder}
            error={errors.value?.message}
            startAdornment={
              activeField === 'email' ? (
                <Mail className="size-4" />
              ) : (
                <Phone className="size-4" />
              )
            }
          />

          <div className="flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="touch-manipulation"
            >
              انصراف
            </Button>
            <Button type="submit" className="touch-manipulation px-5">
              ذخیره
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

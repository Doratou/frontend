import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { Check, Lock, Mail, Pencil, Phone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { displayNameSchema, formatIranPhone } from '../schemas';
import type { ContactDialogField, ProfileRole } from '../types';

export interface ProfilePersonalInfoCardProps {
  displayName: string;
  role: ProfileRole;
  email?: string | null;
  phone?: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  passwordLastChangedLabel: string;
  nameInputRef?: React.RefObject<HTMLInputElement | null>;
  onSaveDisplayName: (nextName: string) => void;
  onOpenContactDialog: (field: ContactDialogField) => void;
}

const ROLE_LABELS: Record<ProfileRole, string> = {
  USER: 'کاربر',
  ADMIN: 'مدیر',
};

export function ProfilePersonalInfoCard({
  displayName,
  role,
  email,
  phone,
  isPhoneVerified,
  isEmailVerified,
  passwordLastChangedLabel,
  nameInputRef,
  onSaveDisplayName,
  onOpenContactDialog,
}: ProfilePersonalInfoCardProps) {
  const internalNameRef = useRef<HTMLInputElement>(null);
  const inputRef = nameInputRef ?? internalNameRef;

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const currentNameValue = nameDraft ?? displayName;
  const isNameDirty =
    nameDraft !== null && nameDraft.trim() !== displayName.trim();

  const commitDisplayName = () => {
    const parsed = displayNameSchema.safeParse(currentNameValue);
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? 'نام معتبر نیست.');
      return;
    }
    setNameError(null);
    setNameDraft(null);
    if (parsed.data !== displayName) {
      onSaveDisplayName(parsed.data);
    }
  };

  const hasEmail = Boolean(email?.trim());
  const hasPhone = Boolean(phone?.trim());

  return (
    <section
      aria-label="اطلاعات شخصی"
      className="flex h-full flex-col gap-4 rounded-[20px] border border-primary-20 bg-white p-4.5 md:p-5 dark:border-border dark:bg-card"
    >
      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <h2 className="text-heading-6 text-primary-80 md:text-heading-5 dark:text-foreground">
          اطلاعات شخصی
        </h2>
        <p className="text-caption text-neutral-70 dark:text-muted-foreground">
          اطلاعات حساب خود را مشاهده و ویرایش کنید
        </p>
      </div>

      {/* Row 1: Identity (Name + Role) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="profile-display-name"
            className="text-caption text-neutral-70 dark:text-muted-foreground"
          >
            نام و نام خانوادگی
          </label>
          <div
            className={cn(
              'flex h-10.5 items-center gap-2 rounded-xl border bg-primary-10 px-3 transition-colors focus-within:border-primary-60 focus-within:ring-2 focus-within:ring-ring/20 dark:bg-muted/50',
              nameError
                ? 'border-destructive'
                : 'border-primary-20 dark:border-border',
            )}
          >
            <input
              ref={inputRef}
              id="profile-display-name"
              type="text"
              dir="auto"
              value={currentNameValue}
              onChange={(event) => {
                setNameDraft(event.target.value);
                if (nameError) setNameError(null);
              }}
              onBlur={() => {
                if (isNameDirty) {
                  commitDisplayName();
                } else {
                  setNameDraft(null);
                  setNameError(null);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitDisplayName();
                  event.currentTarget.blur();
                } else if (event.key === 'Escape') {
                  setNameDraft(null);
                  setNameError(null);
                  event.currentTarget.blur();
                }
              }}
              aria-invalid={Boolean(nameError)}
              className="min-w-0 flex-1 bg-transparent text-paragraph-sm text-neutral-80 outline-hidden placeholder:text-neutral-50 dark:text-foreground"
            />
            {isNameDirty ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={commitDisplayName}
                aria-label="ذخیره نام و نام خانوادگی"
                className="flex size-7 shrink-0 touch-manipulation items-center justify-center rounded-lg bg-primary-70 text-white transition-colors hover:bg-primary-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Check aria-hidden="true" className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                aria-label="ویرایش نام و نام خانوادگی"
                className="flex size-7 shrink-0 touch-manipulation items-center justify-center rounded-lg text-primary-60 transition-colors hover:bg-primary-20/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-primary-30 dark:hover:bg-muted"
              >
                <Pencil aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
          {nameError && (
            <p role="alert" className="text-caption text-destructive">
              {nameError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-caption text-neutral-70 dark:text-muted-foreground">
            نقش
          </span>
          <div className="flex h-10.5 items-center justify-between gap-2 rounded-xl border border-primary-20 bg-primary-10 px-3 opacity-75 dark:border-border dark:bg-muted/40">
            <span className="text-paragraph-sm text-neutral-70 dark:text-muted-foreground">
              {ROLE_LABELS[role] ?? ROLE_LABELS.USER}
            </span>
            <Lock
              aria-hidden="true"
              className="size-4 shrink-0 text-neutral-60 dark:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-primary-10 dark:bg-border/70" />

      {/* Row 2: Contact (Email + Phone) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Email field */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption text-neutral-70 dark:text-muted-foreground">
              ایمیل
            </span>
            <button
              type="button"
              onClick={() => onOpenContactDialog('email')}
              className="inline-flex touch-manipulation items-center gap-1.5 rounded-full border border-primary-20 bg-primary-10 px-2.5 py-1 text-caption text-primary-70 transition-colors hover:bg-primary-20/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-border dark:bg-primary-80/40 dark:text-primary-20"
            >
              {hasEmail ? (
                <Pencil aria-hidden="true" className="size-3" />
              ) : (
                <Plus aria-hidden="true" className="size-3.5" />
              )}
              <span>{hasEmail ? 'تغییر دادن' : 'ثبت ایمیل'}</span>
            </button>
          </div>

          {hasEmail ? (
            <div
              className={cn(
                'flex h-11 items-center justify-between gap-2.5 rounded-xl border px-3',
                isEmailVerified
                  ? 'border-success-20 bg-success-10 dark:border-success-50/35 dark:bg-success-60/15'
                  : 'border-primary-20 bg-primary-10/60 dark:border-border dark:bg-muted/40',
              )}
            >
              <span className="min-w-0 truncate text-paragraph-sm text-neutral-80 dark:text-foreground">
                <bdi dir="ltr">{email}</bdi>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  isEmailVerified
                    ? 'bg-success-50 text-white'
                    : 'bg-primary-10 text-primary-60 dark:bg-muted dark:text-primary-30',
                )}
              >
                {isEmailVerified ? (
                  <Check className="size-3.5" strokeWidth={2.5} />
                ) : (
                  <Mail className="size-3.5" />
                )}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenContactDialog('email')}
              className="flex h-11 w-full touch-manipulation items-center justify-between gap-2.5 rounded-xl border border-dashed border-primary-30 bg-white px-3 text-start transition-colors hover:border-primary-50 hover:bg-primary-10/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-border dark:bg-card dark:hover:bg-muted/30"
            >
              <span className="text-paragraph-sm text-neutral-70 dark:text-muted-foreground">
                هنوز ثبت نشده
              </span>
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-10 text-primary-60 dark:bg-muted dark:text-primary-30"
              >
                <Mail className="size-3.5" />
              </span>
            </button>
          )}

          <p
            className={cn(
              'text-caption',
              hasEmail && isEmailVerified
                ? 'text-success-50 dark:text-success-20'
                : 'text-neutral-70 dark:text-muted-foreground',
            )}
          >
            {hasEmail
              ? isEmailVerified
                ? 'تأیید شده'
                : 'ایمیل ثبت شده است.'
              : 'هنوز ایمیلی ثبت نشده است.'}
          </p>
        </div>

        {/* Phone field */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption text-neutral-70 dark:text-muted-foreground">
              شماره تلفن
            </span>
            <button
              type="button"
              onClick={() => onOpenContactDialog('phone')}
              className="inline-flex touch-manipulation items-center gap-1.5 rounded-full border border-primary-20 bg-primary-10 px-2.5 py-1 text-caption text-primary-70 transition-colors hover:bg-primary-20/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-border dark:bg-primary-80/40 dark:text-primary-20"
            >
              {hasPhone ? (
                <Pencil aria-hidden="true" className="size-3" />
              ) : (
                <Plus aria-hidden="true" className="size-3.5" />
              )}
              <span>{hasPhone ? 'تغییر دادن' : 'ثبت شماره'}</span>
            </button>
          </div>

          {hasPhone ? (
            <div
              className={cn(
                'flex h-11 items-center justify-between gap-2.5 rounded-xl border px-3',
                isPhoneVerified
                  ? 'border-success-20 bg-success-10 dark:border-success-50/35 dark:bg-success-60/15'
                  : 'border-primary-20 bg-primary-10/60 dark:border-border dark:bg-muted/40',
              )}
            >
              <span className="min-w-0 truncate text-paragraph-sm text-neutral-80 tabular-nums dark:text-foreground">
                <bdi dir="ltr">{formatIranPhone(phone ?? '')}</bdi>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  isPhoneVerified
                    ? 'bg-success-50 text-white'
                    : 'bg-primary-10 text-primary-60 dark:bg-muted dark:text-primary-30',
                )}
              >
                {isPhoneVerified ? (
                  <Check className="size-3.5" strokeWidth={2.5} />
                ) : (
                  <Phone className="size-3.5" />
                )}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenContactDialog('phone')}
              className="flex h-11 w-full touch-manipulation items-center justify-between gap-2.5 rounded-xl border border-dashed border-primary-30 bg-white px-3 text-start transition-colors hover:border-primary-50 hover:bg-primary-10/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-border dark:bg-card dark:hover:bg-muted/30"
            >
              <span className="text-paragraph-sm text-neutral-70 dark:text-muted-foreground">
                هنوز ثبت نشده
              </span>
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-10 text-primary-60 dark:bg-muted dark:text-primary-30"
              >
                <Phone className="size-3.5" />
              </span>
            </button>
          )}

          <p
            className={cn(
              'text-caption',
              hasPhone && isPhoneVerified
                ? 'text-success-50 dark:text-success-20'
                : 'text-neutral-70 dark:text-muted-foreground',
            )}
          >
            {hasPhone
              ? isPhoneVerified
                ? 'تأیید شده'
                : 'در انتظار تأیید'
              : 'هنوز شماره تلفنی ثبت نشده است.'}
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-primary-10 dark:bg-border/70" />

      {/* Row 3: Password */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex size-10.5 shrink-0 items-center justify-center rounded-[13px] bg-primary-10 text-primary-70 dark:bg-muted dark:text-primary-30"
          >
            <Lock className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-button-sm text-neutral-80 dark:text-foreground">
              رمز عبور
            </p>
            <p className="text-caption text-neutral-70 dark:text-muted-foreground">
              {passwordLastChangedLabel}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          asChild
          className="h-9 w-full touch-manipulation rounded-[10px] px-3.5 text-button-sm sm:w-auto"
        >
          <Link to="/change-password">تغییر رمز عبور</Link>
        </Button>
      </div>
    </section>
  );
}

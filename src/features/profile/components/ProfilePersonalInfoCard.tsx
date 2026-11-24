import { useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Lock,
  Mail,
  Pencil,
  Phone,
  Plus,
  User,
} from 'lucide-react';
import { TextField } from '@/components/custom/text-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { displayNameSchema, formatIranPhone } from '../schemas';
import type { ContactDialogField } from '../types';

export interface ProfilePersonalInfoCardProps {
  displayName: string;
  email?: string | null;
  phone?: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  passwordLastChangedLabel: string;
  isSavingName?: boolean;
  nameInputRef?: React.RefObject<HTMLInputElement | null>;
  isEditingName?: boolean;
  onEditingNameChange?: (editing: boolean) => void;
  onSaveDisplayName: (nextName: string) => Promise<boolean>;
  onOpenContactDialog: (field: ContactDialogField) => void;
  onOpenPasswordDialog: () => void;
  mobileExpanded?: boolean;
  onToggleMobileExpanded?: () => void;
}

function ContactTextField({
  label,
  type,
  createLabel,
  emptyStatusLabel,
  unverifiedLabel,
  displayValue,
  isVerified,
  icon,
  tabularNums = false,
  onOpen,
}: {
  label: string;
  type: 'email' | 'tel';
  createLabel: string;
  emptyStatusLabel: string;
  unverifiedLabel: string;
  displayValue: string | null;
  isVerified: boolean;
  icon: React.ReactNode;
  tabularNums?: boolean;
  onOpen: () => void;
}) {
  const hasValue = Boolean(displayValue);
  const verified = hasValue && isVerified;

  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <TextField
          label={label}
          type={hasValue ? type : 'text'}
          dir={hasValue ? 'ltr' : 'rtl'}
          readOnly
          iconCircle={false}
          value={displayValue ?? 'هنوز ثبت نشده'}
          status={verified ? 'success' : 'default'}
          statusIconPosition="inside"
          startAdornment={icon}
          description={
            hasValue
              ? isVerified
                ? 'تأیید شده'
                : unverifiedLabel
              : emptyStatusLabel
          }
          onClick={!hasValue ? onOpen : undefined}
          className={
            !hasValue
              ? 'cursor-pointer text-neutral-60'
              : tabularNums
                ? 'tabular-nums'
                : undefined
          }
          endAdornment={
            !hasValue ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                radius="full"
                onClick={onOpen}
                startIcon={<Plus className="size-3.5" />}
                className="h-6.5 border-primary-20 bg-primary-10/80 px-2.5 text-caption font-medium text-primary-70 shadow-2xs hover:border-primary-30 hover:bg-primary-20/60"
              >
                {createLabel}
              </Button>
            ) : undefined
          }
        />
      </div>
      {hasValue ? (
        <Button
          type="button"
          variant="outline"
          size="icon-md"
          radius="full"
          onClick={onOpen}
          aria-label={`تغییر ${label}`}
          className={cn(
            'mt-1.5 size-8 shrink-0 shadow-2xs',
            verified
              ? 'border-secondary-30/80 bg-white/95 text-secondary-70 hover:border-secondary-50 hover:bg-secondary-10/60'
              : 'border-primary-20 bg-primary-10/80 text-primary-70 hover:border-primary-30 hover:bg-primary-20/60',
          )}
        >
          <Pencil aria-hidden="true" className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

export function ProfilePersonalInfoCard({
  displayName,
  email,
  phone,
  isPhoneVerified,
  isEmailVerified,
  passwordLastChangedLabel,
  isSavingName = false,
  nameInputRef,
  isEditingName: controlledEditingName,
  onEditingNameChange,
  onSaveDisplayName,
  onOpenContactDialog,
  onOpenPasswordDialog,
  mobileExpanded = false,
  onToggleMobileExpanded,
}: ProfilePersonalInfoCardProps) {
  const internalNameRef = useRef<HTMLInputElement>(null);
  const inputRef = nameInputRef ?? internalNameRef;
  const skipBlurRef = useRef(false);
  const isCommittingRef = useRef(false);

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [uncontrolledEditingName, setUncontrolledEditingName] = useState(false);

  const isEditingName = controlledEditingName ?? uncontrolledEditingName;
  const setIsEditingName = (next: boolean) => {
    if (controlledEditingName === undefined) {
      setUncontrolledEditingName(next);
    }
    onEditingNameChange?.(next);
  };

  const currentNameValue = nameDraft ?? displayName;
  const isNameDirty =
    nameDraft !== null && nameDraft.trim() !== displayName.trim();

  const commitDisplayName = async () => {
    if (isSavingName || isCommittingRef.current) return;
    const parsed = displayNameSchema.safeParse(currentNameValue);
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? 'نام معتبر نیست.');
      return;
    }
    setNameError(null);
    if (parsed.data === displayName) {
      setNameDraft(null);
      setIsEditingName(false);
      return;
    }
    isCommittingRef.current = true;
    try {
      const saved = await onSaveDisplayName(parsed.data);
      if (saved) {
        setNameDraft(null);
        setIsEditingName(false);
      }
    } finally {
      isCommittingRef.current = false;
    }
  };

  return (
    <section
      aria-label="اطلاعات شخصی"
      className="flex h-full flex-col gap-4 rounded-[20px] border border-white bg-white/95 p-4.5 shadow-[0_4px_14px_rgba(58,53,135,0.05)] md:p-5 dark:border-border dark:bg-muted/45 dark:shadow-none"
    >
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-heading-6 text-primary-80 md:text-heading-5 dark:text-foreground">
            اطلاعات شخصی
          </h2>
          <p className="text-caption text-neutral-70 dark:text-muted-foreground">
            اطلاعات حساب خود را مشاهده و ویرایش کنید
          </p>
        </div>

        {onToggleMobileExpanded && (
          <Button
            type="button"
            variant="outline"
            size="icon-md"
            radius="full"
            aria-expanded={mobileExpanded}
            aria-label={
              mobileExpanded ? 'بستن اطلاعات شخصی' : 'نمایش اطلاعات شخصی'
            }
            onClick={onToggleMobileExpanded}
            className="size-8.5 shrink-0 border-primary-20 bg-primary-10/70 text-primary-70 after:absolute after:inset-0 hover:bg-primary-10 md:hidden md:after:hidden"
          >
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'size-4 transition-transform duration-200 motion-reduce:transition-none',
                mobileExpanded && 'rotate-180',
              )}
            />
          </Button>
        )}
      </div>

      <div
        className={cn(
          'flex-col gap-4',
          mobileExpanded || !onToggleMobileExpanded ? 'flex' : 'hidden md:flex',
        )}
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <TextField
              ref={inputRef}
              id="profile-display-name"
              label="نام و نام خانوادگی"
              dir="auto"
              iconCircle={false}
              disabled={!isEditingName || isSavingName}
              value={currentNameValue}
              error={nameError ?? undefined}
              startAdornment={<User className="size-4" />}
              onChange={(event) => {
                setNameDraft(event.target.value);
                if (nameError) setNameError(null);
              }}
              onBlur={() => {
                if (
                  skipBlurRef.current ||
                  isSavingName ||
                  isCommittingRef.current
                ) {
                  skipBlurRef.current = false;
                  return;
                }
                if (isNameDirty) {
                  void commitDisplayName();
                } else {
                  setNameDraft(null);
                  setNameError(null);
                  setIsEditingName(false);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  skipBlurRef.current = true;
                  event.currentTarget.blur();
                  void commitDisplayName();
                } else if (event.key === 'Escape') {
                  skipBlurRef.current = true;
                  setNameDraft(null);
                  setNameError(null);
                  setIsEditingName(false);
                  event.currentTarget.blur();
                }
              }}
            />
          </div>
          {isSavingName ? (
            <span
              aria-hidden="true"
              className="mt-1.5 flex size-8 shrink-0 items-center justify-center text-primary-60"
            >
              <Spinner className="size-3.5" />
            </span>
          ) : isEditingName ? (
            <Button
              type="button"
              size="icon-md"
              radius="full"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void commitDisplayName()}
              aria-label="ذخیره نام و نام خانوادگی"
              className="mt-1.5 size-8 shrink-0"
            >
              <Check aria-hidden="true" className="size-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="icon-md"
              radius="full"
              onClick={() => {
                setIsEditingName(true);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              aria-label="ویرایش نام و نام خانوادگی"
              className="mt-1.5 size-8 shrink-0 border-primary-20 bg-primary-10/80 text-primary-70 shadow-2xs hover:border-primary-30 hover:bg-primary-20/60"
            >
              <Pencil aria-hidden="true" className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="h-px w-full bg-primary-10 dark:bg-border/70" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ContactTextField
            label="ایمیل"
            type="email"
            createLabel="ثبت ایمیل"
            emptyStatusLabel="هنوز ایمیلی ثبت نشده است."
            unverifiedLabel="ایمیل ثبت شده است."
            displayValue={email?.trim() || null}
            isVerified={isEmailVerified}
            icon={<Mail className="size-4" />}
            onOpen={() => onOpenContactDialog('email')}
          />
          <ContactTextField
            label="شماره تلفن"
            type="tel"
            createLabel="ثبت شماره"
            emptyStatusLabel="هنوز شماره تلفنی ثبت نشده است."
            unverifiedLabel="در انتظار تأیید"
            displayValue={phone?.trim() ? formatIranPhone(phone) : null}
            isVerified={isPhoneVerified}
            icon={<Phone className="size-4" />}
            tabularNums
            onOpen={() => onOpenContactDialog('phone')}
          />
        </div>

        <div className="h-px w-full bg-primary-10 dark:bg-border/70" />

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
            type="button"
            variant="outline"
            onClick={onOpenPasswordDialog}
            className="h-9 w-full touch-manipulation rounded-[10px] px-3.5 text-button-sm sm:w-auto"
          >
            تغییر رمز عبور
          </Button>
        </div>
      </div>
    </section>
  );
}

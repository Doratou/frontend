import { useId, useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField, type TextFieldProps } from '@/components/custom/text-field';

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'endAdornment'>;

export function PasswordField({
  id,
  disabled,
  dir = 'ltr',
  startAdornment = <LockKeyhole />,
  spellCheck = false,
  autoCapitalize = 'none',
  ...props
}: PasswordFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      id={fieldId}
      disabled={disabled}
      dir={dir}
      startAdornment={startAdornment}
      spellCheck={spellCheck}
      autoCapitalize={autoCapitalize}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <Button
          size="icon"
          variant="ghost"
          radius="full"
          className="size-8 bg-clip-content p-0.5 [&_svg]:size-4.5"
          disabled={disabled}
          aria-label={visible ? 'پنهان‌کردن رمز عبور' : 'نمایش رمز عبور'}
          aria-pressed={visible}
          aria-controls={fieldId}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      }
    />
  );
}

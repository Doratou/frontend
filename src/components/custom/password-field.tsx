import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField, type TextFieldProps } from '@/components/custom/text-field';

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'endAdornment'>;

export function PasswordField({
  id,
  disabled,
  dir = 'ltr',
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
      type={visible ? 'text' : 'password'}
      endAdornment={
        <Button
          size="icon"
          variant="ghost"
          className="size-9"
          disabled={disabled}
          aria-label="نمایش رمز عبور"
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

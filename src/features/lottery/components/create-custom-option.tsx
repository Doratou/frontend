import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LOTTERY_OPTION_MAX_LENGTH } from '@/features/lottery/config';

interface CreateCustomOptionProps {
  // Returns an error message when the option cannot be added, otherwise null.
  onAdd: (label: string) => string | null;
}

export function CreateCustomOption({ onAdd }: CreateCustomOptionProps) {
  const inputId = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const label = value.trim();
    if (!label) {
      setError('نام گزینه را وارد کنید.');
      return;
    }
    const message = onAdd(label);
    if (message) {
      setError(message);
      return;
    }
    setValue('');
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={inputId} className="text-heading-mobile-6">
          افزودن گزینه‌ی دلخواه
        </label>
        <p className="text-caption text-muted-foreground">
          هر چیزی می‌تواند گزینه باشد؛ مثلاً یک مکان یا نام دلخواه
        </p>
      </div>
      <div className="flex items-start gap-2">
        <Input
          id={inputId}
          value={value}
          autoComplete="off"
          maxLength={LOTTERY_OPTION_MAX_LENGTH}
          placeholder="نام گزینه را وارد کنید"
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            // Enter adds the option instead of submitting the whole form.
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
        />
        <Button
          size="lg"
          tone="secondary"
          radius="lg"
          className="h-9.5 shrink-0 bg-secondary-70 hover:bg-secondary-80"
          onClick={submit}
          endIcon={<Plus />}
        >
          افزودن گزینه
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

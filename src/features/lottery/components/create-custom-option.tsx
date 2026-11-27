import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TextField } from '@/components/custom/text-field';
import { Button } from '@/components/ui/button';
import { LOTTERY_OPTION_MAX_LENGTH } from '@/features/lottery/config';

interface CreateCustomOptionProps {
  // Returns an error message when the option cannot be added, otherwise null.
  onAdd: (label: string) => string | null;
}

export function CreateCustomOption({ onAdd }: CreateCustomOptionProps) {
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
    <div className="flex flex-col gap-3">
      <h3 className="text-heading-mobile-6">افزودن گزینه‌ی دلخواه</h3>
      {/* items-start keeps the button aligned with the field, not with its hint. */}
      <div className="flex items-start gap-2">
        <TextField
          containerClassName="min-w-0 flex-1"
          label="نام گزینه"
          description="هر چیزی می‌تواند گزینه باشد؛ مثلاً یک مکان یا نام دلخواه"
          autoComplete="off"
          maxLength={LOTTERY_OPTION_MAX_LENGTH}
          value={value}
          error={error ?? undefined}
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
        {/* h-9.5 matches the height of the text field next to it. */}
        <Button
          variant="outline"
          tone="secondary"
          radius="md"
          className="h-9.5 shrink-0"
          onClick={submit}
          endIcon={<Plus className="size-4" />}
        >
          افزودن
        </Button>
      </div>
    </div>
  );
}

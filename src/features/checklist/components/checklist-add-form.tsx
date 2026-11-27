import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { LoadingButton } from '@/components/custom/loading-button';
import { TextField } from '@/components/custom/text-field';
import { CHECKLIST_TITLE_MAX_LENGTH } from '@/features/checklist/config';
import { useCreateChecklistItem } from '@/features/checklist/hooks/use-create-checklist-item';
import { checklistTitleSchema } from '@/features/checklist/schemas';
import { useGroupId } from '@/features/groups/hooks/use-group-id';
import type { ChecklistItemType } from '@/features/checklist/types';

interface ChecklistAddFormProps {
  type: ChecklistItemType;
  // A noun phrase: it becomes the floating label of the field.
  label: string;
}

export function ChecklistAddForm({ type, label }: ChecklistAddFormProps) {
  const groupId = useGroupId();
  const create = useCreateChecklistItem(groupId);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string>();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    setError(undefined);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = checklistTitleSchema.safeParse(title);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    create.mutate(
      { title: parsed.data, type },
      { onSuccess: () => setTitle('') },
    );
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex items-start gap-2">
      <TextField
        label={label}
        value={title}
        onChange={handleChange}
        error={error}
        disabled={create.isPending}
        maxLength={CHECKLIST_TITLE_MAX_LENGTH}
        autoComplete="off"
        containerClassName="min-w-0 flex-1"
      />
      <LoadingButton
        type="submit"
        tone="secondary"
        radius="md"
        endIcon={<Plus className="size-4" />}
        isLoading={create.isPending}
        disabled={title.trim() === ''}
        className="h-11 shrink-0 md:h-10"
      >
        افزودن
      </LoadingButton>
    </form>
  );
}

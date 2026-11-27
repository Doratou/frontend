import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { AuthError } from '@/features/auth/api/auth-error';

export function applyAuthFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  allowed: readonly FieldPath<T>[],
) {
  if (!(error instanceof AuthError)) return;
  for (const field of allowed) {
    const message = error.fields[field];
    if (message) setError(field, { type: 'server', message });
  }
}

import { z } from 'zod';

function isApiBaseUrl(value: string) {
  if (
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\')
  ) {
    return !/[?#\s]/.test(value);
  }
  try {
    const url = new URL(value);
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

const envSchema = z.object({
  VITE_AUTH_API_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  VITE_API_BASE_URL: z
    .string()
    .trim()
    .min(1)
    .refine(isApiBaseUrl)
    .default('https://api.example.invalid/api/v1'),
  // Bruno's OTP examples use 5 digits; its send response does not expose length.
  VITE_AUTH_OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(5),
  VITE_API_WITH_CREDENTIALS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  VITE_GOOGLE_CLIENT_ID: z.string().trim().default(''),
});

export function parseEnv(input: Record<string, unknown>) {
  const result = envSchema.safeParse(input);
  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join('.'))),
    ];
    throw new Error(
      `Invalid public environment configuration: ${fields.join(', ')}`,
    );
  }
  return result.data;
}

export const env = parseEnv(import.meta.env);

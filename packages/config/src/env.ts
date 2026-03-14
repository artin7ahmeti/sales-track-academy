import { z } from 'zod';

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const optionalEnvString = z.preprocess(
  emptyStringToUndefined,
  z.string().min(1).optional(),
);

const optionalEnvBoolean = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toLowerCase();
  if (normalized === '') return undefined;
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;

  return value;
}, z.boolean().optional());

export const apiEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  AWS_S3_BUCKET: z.string(),
  AWS_S3_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  SMTP_HOST: optionalEnvString,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: optionalEnvString,
  SMTP_PASS: optionalEnvString,
  SMTP_FROM: optionalEnvString,
  SMTP_SECURE: optionalEnvBoolean,
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  API_PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
}).superRefine((env, ctx) => {
  const smtpFields = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'] as const;
  const hasAnySmtpField = smtpFields.some((field) => Boolean(env[field]));

  if (!hasAnySmtpField) {
    return;
  }

  for (const field of smtpFields) {
    if (!env[field]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `${field} is required when SMTP is configured`,
      });
    }
  }
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001/api'),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export function parseApiEnv(): ApiEnv {
  return apiEnvSchema.parse(process.env);
}

export function parseWebEnv(): WebEnv {
  return webEnvSchema.parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });
}

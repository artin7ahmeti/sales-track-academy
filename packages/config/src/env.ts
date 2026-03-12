import { z } from 'zod';

// ─── API Environment Schema ─────────────────────────────

export const apiEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  AWS_S3_BUCKET: z.string(),
  AWS_S3_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  API_PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

// ─── Web Environment Schema ─────────────────────────────

export const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001/api'),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

// ─── Helpers ─────────────────────────────────────────────

export function parseApiEnv(): ApiEnv {
  return apiEnvSchema.parse(process.env);
}

export function parseWebEnv(): WebEnv {
  return webEnvSchema.parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });
}

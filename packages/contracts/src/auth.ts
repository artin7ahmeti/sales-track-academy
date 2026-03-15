import { z } from 'zod';

export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}

export const RoleSchema = z.enum(['ADMIN', 'AGENT']);

// ─── Request schemas ─────────────────────────────────────

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
});

export type SignupRequest = z.infer<typeof SignupSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(8),
});

export type AcceptInviteRequest = z.infer<typeof AcceptInviteSchema>;

// ─── Response types ──────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatarUrl: string | null;
  };
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AcceptInviteResponse {
  message: string;
  userId: string;
  email: string;
}

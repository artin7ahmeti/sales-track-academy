import { z } from 'zod';
import { Role, RoleSchema } from './auth';
import { PaginationParamsSchema } from './common';

// ─── Request schemas ─────────────────────────────────────

export const CreateUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: RoleSchema,
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: RoleSchema.optional(),
  isActive: z.boolean().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

export const InviteUserSchema = z.object({
  email: z.email(),
  role: RoleSchema,
  groupIds: z.array(z.string()).optional(),
});

export type InviteUserRequest = z.infer<typeof InviteUserSchema>;

export const UserListQuerySchema = PaginationParamsSchema.extend({
  search: z.string().optional(),
  role: RoleSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export type UserListParams = z.infer<typeof UserListQuerySchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().nullable().optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;

// ─── Response types ──────────────────────────────────────

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetailResponse extends UserResponse {
  groupMemberships: {
    id: string;
    group: {
      id: string;
      name: string;
    };
  }[];
}

export type InvitationEmailStatus = 'sent' | 'skipped' | 'failed';

export interface InviteUserResponse {
  invitationId: string;
  emailStatus: InvitationEmailStatus;
  inviteUrl?: string;
}

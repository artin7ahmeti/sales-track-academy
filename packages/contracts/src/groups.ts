import { z } from 'zod';

// ─── Request schemas ─────────────────────────────────────

export const CreateGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

export type CreateGroupRequest = z.infer<typeof CreateGroupSchema>;

export const UpdateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export type UpdateGroupRequest = z.infer<typeof UpdateGroupSchema>;

export const ManageMembersSchema = z.object({
  userIds: z.array(z.string()),
});

export type ManageMembersRequest = z.infer<typeof ManageMembersSchema>;

// ─── Response types ──────────────────────────────────────

export interface GroupResponse {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupDetailResponse extends GroupResponse {
  members: {
    id: string;
    userId: string;
    user: {
      id: string;
      email: string;
      name: string;
      avatarUrl: string | null;
    };
    joinedAt: string;
  }[];
}

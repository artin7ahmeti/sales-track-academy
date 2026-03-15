import { z } from 'zod';

// ─── Request schemas ─────────────────────────────────────

export const CreateCommentSchema = z.object({
  body: z.string().min(1),
  parentId: z.string().optional(),
});

export type CreateCommentRequest = z.infer<typeof CreateCommentSchema>;

export const UpdateCommentSchema = z.object({
  body: z.string().min(1),
});

export type UpdateCommentRequest = z.infer<typeof UpdateCommentSchema>;

// ─── Response types ──────────────────────────────────────

export interface CommentResponse {
  id: string;
  lessonId: string;
  userId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  };
  replies: CommentResponse[];
}

import { z } from 'zod';

// ─── Request schemas ─────────────────────────────────────

export const UploadUrlSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  entityType: z.enum(['course-thumbnail', 'lesson-content']),
  entityId: z.string().min(1),
});

export type UploadUrlRequest = z.infer<typeof UploadUrlSchema>;

export const ConfirmUploadSchema = z.object({
  key: z.string().min(1),
});

export type ConfirmUploadRequest = z.infer<typeof ConfirmUploadSchema>;

// ─── Response types ──────────────────────────────────────

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface FileUrlResponse {
  url: string;
  expiresIn: number;
}

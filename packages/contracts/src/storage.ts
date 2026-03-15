import { z } from 'zod';

// ─── Constants ──────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_LESSON_TYPES = [
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'application/pdf',
] as const;
export const ALLOWED_CONTENT_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_LESSON_TYPES] as const;

const entityTypeEnum = z.enum(['course-thumbnail', 'lesson-content', 'user-avatar']);

// ─── Request schemas ─────────────────────────────────────

export const UploadUrlSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  entityType: entityTypeEnum,
  entityId: z.string().min(1),
}).refine((data) => {
  if (data.entityType === 'course-thumbnail' || data.entityType === 'user-avatar') {
    return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(data.contentType);
  }
  if (data.entityType === 'lesson-content') {
    return (ALLOWED_LESSON_TYPES as readonly string[]).includes(data.contentType);
  }
  return false;
}, {
  message: 'Invalid content type for this entity type',
  path: ['contentType'],
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

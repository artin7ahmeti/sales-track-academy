import { z } from 'zod';

export enum LessonType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  PDF = 'PDF',
  TEXT = 'TEXT',
}

export const LessonTypeSchema = z.enum(['VIDEO', 'AUDIO', 'PDF', 'TEXT']);

// ─── Content payloads ────────────────────────────────────

export interface VideoContent {
  url: string;
  source: 's3' | 'youtube' | 'vimeo';
  s3Key?: string;
}

export interface AudioContent {
  url: string;
  s3Key: string;
}

export interface PdfContent {
  url: string;
  s3Key: string;
  pageCount?: number;
}

export interface TextContent {
  body: string;
}

export type LessonContentPayload =
  | { type: LessonType.VIDEO; content: VideoContent }
  | { type: LessonType.AUDIO; content: AudioContent }
  | { type: LessonType.PDF; content: PdfContent }
  | { type: LessonType.TEXT; content: TextContent };

// ─── Request schemas ─────────────────────────────────────

export const CreateLessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: LessonTypeSchema,
  content: z.record(z.string(), z.unknown()),
  durationSec: z.number().int().min(0).optional(),
});

export type CreateLessonRequest = z.infer<typeof CreateLessonSchema>;

export const UpdateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  durationSec: z.number().int().min(0).nullable().optional(),
});

export type UpdateLessonRequest = z.infer<typeof UpdateLessonSchema>;

export const ReorderLessonsSchema = z.object({
  lessonIds: z.array(z.string().min(1)),
});

export type ReorderLessonsRequest = z.infer<typeof ReorderLessonsSchema>;

export const UpdateProgressSchema = z.object({
  progressPct: z.number().int().min(0).max(100),
  lastPosition: z.number().int().min(0).optional(),
});

export type UpdateProgressRequest = z.infer<typeof UpdateProgressSchema>;

// ─── Response types ──────────────────────────────────────

export interface LessonResponse {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  type: LessonType;
  content: VideoContent | AudioContent | PdfContent | TextContent;
  sortOrder: number;
  durationSec: number | null;
  createdAt: string;
  updatedAt: string;
}

export enum LessonType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  PDF = 'PDF',
  TEXT = 'TEXT',
}

// ─── Content payloads (discriminated union) ──────────────

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

// ─── API types ───────────────────────────────────────────

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

export interface CreateLessonRequest {
  title: string;
  description?: string;
  type: LessonType;
  content: VideoContent | AudioContent | PdfContent | TextContent;
  durationSec?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  content?: VideoContent | AudioContent | PdfContent | TextContent;
  durationSec?: number;
}

export interface ReorderLessonsRequest {
  lessonIds: string[];
}

export interface UpdateProgressRequest {
  progressPct: number;
  lastPosition?: number;
}

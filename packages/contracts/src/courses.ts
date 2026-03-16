import { z } from 'zod';
import { PaginationParamsSchema } from './common';

// ─── Request schemas ─────────────────────────────────────

export const CreateCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export type CreateCourseRequest = z.infer<typeof CreateCourseSchema>;

export const UpdateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export type UpdateCourseRequest = z.infer<typeof UpdateCourseSchema>;

export const AssignCourseSchema = z.object({
  userIds: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional(),
});

export type AssignCourseRequest = z.infer<typeof AssignCourseSchema>;

export const UnassignCourseSchema = z.object({
  userIds: z.array(z.string()).min(1),
});

export type UnassignCourseRequest = z.infer<typeof UnassignCourseSchema>;

export const CourseListQuerySchema = PaginationParamsSchema.extend({
  search: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type CourseListParams = z.infer<typeof CourseListQuerySchema>;

// ─── Response types ──────────────────────────────────────

export interface CourseResponse {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  isPublished: boolean;
  lessonCount: number;
  quizCount: number;
  assignmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDetailResponse extends CourseResponse {
  lessons: {
    id: string;
    title: string;
    type: string;
    sortOrder: number;
    durationSec: number | null;
  }[];
  quizzes: {
    id: string;
    title: string;
    passingScore: number;
    questionCount: number;
    sortOrder: number;
  }[];
}

export interface AgentCourseResponse {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  lessonCount: number;
  completedLessons: number;
  progressPct: number;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedAt: string;
  dueDate: string | null;
}

export interface AgentCourseDetailResponse extends CourseDetailResponse {
  lessonProgress: Record<string, { isCompleted: boolean; progressPct: number }>;
  quizAttempts: Record<string, { score: number; passed: boolean }[]>;
  overallProgress: number;
}

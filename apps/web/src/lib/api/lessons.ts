import { apiClient } from './client';

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  type: 'VIDEO' | 'AUDIO' | 'PDF' | 'TEXT';
  content: Record<string, unknown>;
  sortOrder: number;
  durationSec: number | null;
  createdAt: string;
  updatedAt: string;
}

export function getLessons(courseId: string) {
  return apiClient.get<Lesson[]>(`/courses/${courseId}/lessons`);
}

export function getLesson(courseId: string, lessonId: string) {
  return apiClient.get<Lesson>(`/courses/${courseId}/lessons/${lessonId}`);
}

export function createLesson(courseId: string, data: { title: string; description?: string; type: string; content: Record<string, unknown>; durationSec?: number }) {
  return apiClient.post<Lesson>(`/courses/${courseId}/lessons`, data);
}

export function updateLesson(courseId: string, lessonId: string, data: { title?: string; description?: string; content?: Record<string, unknown> }) {
  return apiClient.patch<Lesson>(`/courses/${courseId}/lessons/${lessonId}`, data);
}

export function deleteLesson(courseId: string, lessonId: string) {
  return apiClient.delete(`/courses/${courseId}/lessons/${lessonId}`);
}

export function updateProgress(courseId: string, lessonId: string, data: { progressPct: number; lastPosition?: number }) {
  return apiClient.post(`/courses/${courseId}/lessons/${lessonId}/progress`, data);
}

import { apiClient } from './client';
import type { PaginatedResponse } from './users';

export interface Course {
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

export interface CourseDetail extends Course {
  lessons: { id: string; title: string; type: string; sortOrder: number; durationSec: number | null }[];
  quizzes: { id: string; title: string; lessonId: string | null; passingScore: number; questionCount: number; sortOrder: number }[];
  assignedUserIds: string[];
  assignedGroupIds: string[];
}

export interface AgentCourse {
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

export function getCourses(params?: { page?: number; limit?: number; search?: string; isPublished?: boolean }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.isPublished !== undefined) query.set('isPublished', String(params.isPublished));
  const qs = query.toString();
  return apiClient.get<PaginatedResponse<Course>>(`/courses${qs ? `?${qs}` : ''}`);
}

export function getCourse(id: string) {
  return apiClient.get<CourseDetail>(`/courses/${id}`);
}

export function getMyCourses() {
  return apiClient.get<AgentCourse[]>('/courses/my');
}

export function createCourse(data: { title: string; description?: string; thumbnailUrl?: string }) {
  return apiClient.post<Course>('/courses', data);
}

export function updateCourse(id: string, data: { title?: string; description?: string; isPublished?: boolean }) {
  return apiClient.patch<Course>(`/courses/${id}`, data);
}

export function deleteCourse(id: string) {
  return apiClient.delete(`/courses/${id}`);
}

export function assignCourse(id: string, data: { userIds?: string[]; groupIds?: string[]; dueDate?: string }) {
  return apiClient.post(`/courses/${id}/assign`, data);
}

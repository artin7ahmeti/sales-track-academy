import { apiClient } from './client';

export interface Comment {
  id: string;
  lessonId: string;
  userId: string;
  parentId: string | null;
  body: string;
  user: { id: string; name: string; avatarUrl: string | null };
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export function getComments(lessonId: string) {
  return apiClient.get<Comment[]>(`/lessons/${lessonId}/comments`);
}

export function createComment(lessonId: string, data: { body: string; parentId?: string }) {
  return apiClient.post<Comment>(`/lessons/${lessonId}/comments`, data);
}

export function updateComment(commentId: string, data: { body: string }) {
  return apiClient.patch<Comment>(`/comments/${commentId}`, data);
}

export function deleteComment(commentId: string) {
  return apiClient.delete(`/comments/${commentId}`);
}

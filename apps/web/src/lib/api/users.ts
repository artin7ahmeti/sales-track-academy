import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'AGENT';
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface InviteUserResponse {
  invitationId: string;
  emailStatus: 'sent' | 'skipped' | 'failed';
  inviteUrl?: string;
}

export function getUsers(params?: { page?: number; limit?: number; search?: string; role?: string; isActive?: boolean }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.role) query.set('role', params.role);
  if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
  const qs = query.toString();
  return apiClient.get<PaginatedResponse<User>>(`/users${qs ? `?${qs}` : ''}`);
}

export function getUser(id: string) {
  return apiClient.get<User & { groupMemberships: { id: string; group: { id: string; name: string } }[] }>(`/users/${id}`);
}

export function createUser(data: { email: string; name: string; password: string; role: string }) {
  return apiClient.post<User>('/users', data);
}

export function updateUser(id: string, data: { name?: string; role?: string; isActive?: boolean }) {
  return apiClient.patch<User>(`/users/${id}`, data);
}

export function updateMyProfile(data: { name?: string; avatarUrl?: string | null }) {
  return apiClient.patch<User>('/users/me', data);
}

export function deleteUser(id: string) {
  return apiClient.delete(`/users/${id}`);
}

export function inviteUser(data: { email: string; role: string; groupIds?: string[] }) {
  return apiClient.post<InviteUserResponse>('/users/invite', data);
}

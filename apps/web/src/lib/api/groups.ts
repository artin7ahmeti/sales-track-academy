import { apiClient } from './client';
import type { PaginatedResponse } from './users';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupDetail extends Group {
  members: { id: string; userId: string; user: { id: string; email: string; name: string; avatarUrl: string | null }; joinedAt: string }[];
}

export function getGroups(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiClient.get<PaginatedResponse<Group>>(`/groups${qs ? `?${qs}` : ''}`);
}

export function getGroup(id: string) {
  return apiClient.get<GroupDetail>(`/groups/${id}`);
}

export function createGroup(data: { name: string; description?: string; memberIds?: string[] }) {
  return apiClient.post<Group>('/groups', data);
}

export function updateGroup(id: string, data: { name?: string; description?: string }) {
  return apiClient.patch<Group>(`/groups/${id}`, data);
}

export function deleteGroup(id: string) {
  return apiClient.delete(`/groups/${id}`);
}

export function addMembers(groupId: string, userIds: string[]) {
  return apiClient.post<GroupDetail>(`/groups/${groupId}/members`, { userIds });
}

export function removeMembers(groupId: string, userIds: string[]) {
  return apiClient.delete(`/groups/${groupId}/members`, { userIds });
}

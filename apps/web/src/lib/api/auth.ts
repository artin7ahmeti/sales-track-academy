import { apiClient } from './client';
import type { LoginResponse } from '@salestrack/contracts';

interface AcceptInviteResponse {
  message: string;
  userId: string;
  email: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/login', { email, password });
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function refreshToken(): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/refresh', {});
}

export async function acceptInvite(
  token: string,
  name: string,
  password: string,
): Promise<AcceptInviteResponse> {
  return apiClient.post('/auth/accept-invite', { token, name, password });
}

export async function signup(
  name: string,
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/signup', { name, email, password });
}

export async function getCurrentUser() {
  return apiClient.get<{
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl: string | null;
  }>('/auth/me');
}

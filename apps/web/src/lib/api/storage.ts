import { apiClient } from './client';

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export function getUploadUrl(data: { fileName: string; contentType: string; entityType: string; entityId: string }) {
  return apiClient.post<UploadUrlResponse>('/storage/upload-url', data);
}

export function confirmUpload(key: string) {
  return apiClient.post('/storage/confirm', { key });
}

export function getDownloadUrl(key: string, inline?: boolean) {
  const params = new URLSearchParams({ key });
  if (inline) params.set('inline', 'true');
  return apiClient.get<{ url: string }>(`/storage/download-url?${params.toString()}`);
}

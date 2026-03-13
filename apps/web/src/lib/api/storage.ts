import { apiClient } from './client';

export interface UploadUrlResponse {
  url: string;
  key: string;
}

export function getUploadUrl(data: { fileName: string; contentType: string; entityType: string; entityId: string }) {
  return apiClient.post<UploadUrlResponse>('/storage/upload-url', data);
}

export function confirmUpload(key: string) {
  return apiClient.post('/storage/confirm', { key });
}

export function getDownloadUrl(key: string) {
  return apiClient.get<{ url: string }>(`/storage/download-url?key=${encodeURIComponent(key)}`);
}

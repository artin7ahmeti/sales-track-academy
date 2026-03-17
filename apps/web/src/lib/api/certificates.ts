import { apiClient } from './client';

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  courseThumbnailUrl: string | null;
  certificateNumber: string;
  issuedAt: string;
}

export function getMyCertificates() {
  return apiClient.get<Certificate[]>('/certificates/my');
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function downloadCertificate(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/certificates/${id}/download`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to download certificate');
  }

  // Extract filename from Content-Disposition header
  const disposition = response.headers.get('Content-Disposition');
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
  const fileName = filenameMatch?.[1] || 'certificate.pdf';

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateCertificate(courseId: string) {
  return apiClient.post<Certificate>(`/certificates/generate/${courseId}`);
}

// ─── Response types ──────────────────────────────────────

export interface CertificateResponse {
  id: string;
  courseId: string;
  courseTitle: string;
  courseThumbnailUrl: string | null;
  certificateNumber: string;
  issuedAt: string;
}

export interface CertificateDownloadResponse {
  url: string;
}

export interface UploadUrlRequest {
  fileName: string;
  contentType: string;
  entityType: 'course-thumbnail' | 'lesson-content';
  entityId: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

export interface ConfirmUploadRequest {
  key: string;
}

export interface FileUrlResponse {
  url: string;
  expiresIn: number;
}

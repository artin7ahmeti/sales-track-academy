export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 100;

export const QUIZ_PASSING_SCORE_DEFAULT = 80;

export const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const PRESIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

export const S3_KEY_PREFIXES = {
  courseThumbnail: (courseId: string) => `courses/${courseId}/thumbnail`,
  lessonContent: (lessonId: string) => `lessons/${lessonId}/content`,
  userAvatar: (userId: string) => `users/${userId}/avatar`,
} as const;

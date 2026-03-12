export interface CommentResponse {
  id: string;
  lessonId: string;
  userId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  };
  replies: CommentResponse[];
}

export interface CreateCommentRequest {
  body: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  body: string;
}

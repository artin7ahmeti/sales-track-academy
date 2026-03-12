export interface CourseResponse {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  isPublished: boolean;
  lessonCount: number;
  quizCount: number;
  assignmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDetailResponse extends CourseResponse {
  lessons: {
    id: string;
    title: string;
    type: string;
    sortOrder: number;
    durationSec: number | null;
  }[];
  quizzes: {
    id: string;
    title: string;
    passingScore: number;
    questionCount: number;
    sortOrder: number;
  }[];
}

export interface AgentCourseResponse {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  lessonCount: number;
  completedLessons: number;
  progressPct: number;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedAt: string;
  dueDate: string | null;
}

export interface AgentCourseDetailResponse extends CourseDetailResponse {
  lessonProgress: Record<string, { isCompleted: boolean; progressPct: number }>;
  quizAttempts: Record<string, { score: number; passed: boolean }[]>;
  overallProgress: number;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface AssignCourseRequest {
  userIds?: string[];
  groupIds?: string[];
  dueDate?: string;
}

export interface CourseListParams {
  page?: number;
  limit?: number;
  search?: string;
  isPublished?: boolean;
}

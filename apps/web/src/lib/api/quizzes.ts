import { apiClient } from './client';

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  description: string | null;
  passingScore: number;
  sortOrder: number;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizDetail extends Quiz {
  questions: {
    id: string;
    text: string;
    sortOrder: number;
    options: { id: string; text: string; sortOrder: number; isCorrect?: boolean }[];
  }[];
}

export interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt: string | null;
  correctAnswers: Record<string, string>;
  userAnswers: Record<string, string>;
}

export interface CreateQuizData {
  title: string;
  description?: string;
  passingScore: number;
  questions: {
    text: string;
    sortOrder: number;
    options: { text: string; sortOrder: number; isCorrect: boolean }[];
  }[];
}

export interface UpdateQuizData {
  title?: string;
  description?: string;
  passingScore?: number;
  questions?: {
    text: string;
    options: { text: string; isCorrect: boolean }[];
  }[];
}

export function getQuizzes(courseId: string) {
  return apiClient.get<Quiz[]>(`/courses/${courseId}/quizzes`);
}

export function createQuiz(courseId: string, data: CreateQuizData, lessonId?: string) {
  const qs = lessonId ? `?lessonId=${lessonId}` : '';
  return apiClient.post<Quiz>(`/courses/${courseId}/quizzes${qs}`, data);
}

export function updateQuiz(courseId: string, quizId: string, data: UpdateQuizData) {
  return apiClient.patch<QuizDetail>(`/courses/${courseId}/quizzes/${quizId}`, data);
}

export function deleteQuiz(courseId: string, quizId: string) {
  return apiClient.delete(`/courses/${courseId}/quizzes/${quizId}`);
}

export function getQuiz(courseId: string, quizId: string) {
  return apiClient.get<QuizDetail>(`/courses/${courseId}/quizzes/${quizId}`);
}

export function getQuizByLesson(courseId: string, lessonId: string) {
  return apiClient.get<QuizDetail | null>(`/courses/${courseId}/quizzes/by-lesson/${lessonId}`);
}

export function submitQuiz(courseId: string, quizId: string, answers: Record<string, string>) {
  return apiClient.post<QuizResult>(`/courses/${courseId}/quizzes/${quizId}/submit`, { answers });
}

export function getAttempts(courseId: string, quizId: string) {
  return apiClient.get<{ id: string; quizId: string; score: number; passed: boolean; startedAt: string; completedAt: string | null }[]>(
    `/courses/${courseId}/quizzes/${quizId}/attempts`,
  );
}

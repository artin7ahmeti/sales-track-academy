import { apiClient } from './client';

export interface Quiz {
  id: string;
  courseId: string;
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

export function getQuizzes(courseId: string) {
  return apiClient.get<Quiz[]>(`/courses/${courseId}/quizzes`);
}

export function getQuiz(courseId: string, quizId: string) {
  return apiClient.get<QuizDetail>(`/courses/${courseId}/quizzes/${quizId}`);
}

export function submitQuiz(courseId: string, quizId: string, answers: Record<string, string>) {
  return apiClient.post<QuizResult>(`/courses/${courseId}/quizzes/${quizId}/submit`, { answers });
}

export function getAttempts(courseId: string, quizId: string) {
  return apiClient.get<{ id: string; quizId: string; score: number; passed: boolean; startedAt: string; completedAt: string | null }[]>(
    `/courses/${courseId}/quizzes/${quizId}/attempts`,
  );
}

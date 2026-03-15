import { z } from 'zod';

// ─── Request schemas ─────────────────────────────────────

export const CreateOptionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const CreateQuestionSchema = z.object({
  text: z.string().min(1),
  options: z.array(CreateOptionSchema).min(2),
});

export const CreateQuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  passingScore: z.number().int().min(1).max(100).optional(),
  questions: z.array(CreateQuestionSchema).min(1),
});

export type CreateQuizRequest = z.infer<typeof CreateQuizSchema>;
export type CreateQuestionRequest = z.infer<typeof CreateQuestionSchema>;

export const UpdateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  passingScore: z.number().int().min(1).max(100).optional(),
  questions: z.array(CreateQuestionSchema).min(1).optional(),
});

export type UpdateQuizRequest = z.infer<typeof UpdateQuizSchema>;

export const SubmitAttemptSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export type SubmitQuizAttemptRequest = z.infer<typeof SubmitAttemptSchema>;

// ─── Response types ──────────────────────────────────────

export interface AnswerOptionResponse {
  id: string;
  text: string;
  sortOrder: number;
}

export interface AnswerOptionWithCorrect extends AnswerOptionResponse {
  isCorrect: boolean;
}

export interface QuestionResponse {
  id: string;
  text: string;
  sortOrder: number;
  options: AnswerOptionResponse[];
}

export interface QuestionWithCorrect {
  id: string;
  text: string;
  sortOrder: number;
  options: AnswerOptionWithCorrect[];
}

export interface QuizResponse {
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

export interface QuizDetailResponse extends QuizResponse {
  questions: QuestionResponse[];
}

export interface QuizDetailWithCorrectResponse extends QuizResponse {
  questions: QuestionWithCorrect[];
}

export interface QuizAttemptResponse {
  id: string;
  quizId: string;
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt: string | null;
}

export interface QuizResultResponse extends QuizAttemptResponse {
  correctAnswers: Record<string, string>;
  userAnswers: Record<string, string>;
}

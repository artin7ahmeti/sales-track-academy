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

export interface CreateQuestionRequest {
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  passingScore?: number;
  questions: CreateQuestionRequest[];
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  passingScore?: number;
  questions?: CreateQuestionRequest[];
}

export interface SubmitQuizAttemptRequest {
  answers: Record<string, string>; // questionId -> selectedOptionId
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
  correctAnswers: Record<string, string>; // questionId -> correctOptionId
  userAnswers: Record<string, string>;
}

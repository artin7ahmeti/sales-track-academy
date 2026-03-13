import { apiClient } from './client';

export interface OrgAnalytics {
  totalUsers: number;
  totalAgents: number;
  totalCourses: number;
  publishedCourses: number;
  overallCompletionRate: number;
  activeLearnersCount: number;
  avgQuizScore: number;
  courseCompletionStats: {
    courseId: string;
    courseTitle: string;
    enrolledCount: number;
    completedCount: number;
    completionRate: number;
    avgQuizScore: number;
  }[];
}

export interface AgentProgress {
  userId: string;
  userName: string;
  totalAssigned: number;
  totalCompleted: number;
  totalInProgress: number;
  overallProgress: number;
  avgQuizScore: number;
  courses: {
    courseId: string;
    courseTitle: string;
    status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
    progressPct: number;
    lessonsCompleted: number;
    totalLessons: number;
    quizScores: { quizTitle: string; score: number; passed: boolean }[];
  }[];
}

export function getOrgAnalytics() {
  return apiClient.get<OrgAnalytics>('/analytics/org');
}

export function getMyProgress() {
  return apiClient.get<AgentProgress>('/analytics/me');
}

export function getAgentProgress(userId: string) {
  return apiClient.get<AgentProgress>(`/analytics/agents/${userId}`);
}

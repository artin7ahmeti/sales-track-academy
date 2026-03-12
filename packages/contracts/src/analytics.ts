export interface OrgAnalyticsResponse {
  totalUsers: number;
  totalAgents: number;
  totalCourses: number;
  publishedCourses: number;
  overallCompletionRate: number;
  activeLearnersCount: number;
  avgQuizScore: number;
  courseCompletionStats: CourseCompletionStat[];
}

export interface CourseCompletionStat {
  courseId: string;
  courseTitle: string;
  enrolledCount: number;
  completedCount: number;
  completionRate: number;
  avgQuizScore: number;
}

export interface AgentProgressResponse {
  userId: string;
  userName: string;
  totalAssigned: number;
  totalCompleted: number;
  totalInProgress: number;
  overallProgress: number;
  avgQuizScore: number;
  courses: AgentCourseProgress[];
}

export interface AgentCourseProgress {
  courseId: string;
  courseTitle: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPct: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizScores: { quizTitle: string; score: number; passed: boolean }[];
}

export interface GroupAnalyticsResponse {
  groupId: string;
  groupName: string;
  memberCount: number;
  avgCompletionRate: number;
  avgQuizScore: number;
  memberProgress: {
    userId: string;
    userName: string;
    completionRate: number;
    avgQuizScore: number;
  }[];
}

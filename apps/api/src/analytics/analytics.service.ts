import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrgAnalytics() {
    const [totalUsers, totalAgents, totalCourses, publishedCourses] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.user.count({ where: { role: 'AGENT', deletedAt: null } }),
        this.prisma.course.count({ where: { deletedAt: null } }),
        this.prisma.course.count({ where: { isPublished: true, deletedAt: null } }),
      ]);

    const assignments = await this.prisma.courseAssignment.findMany({
      where: { userId: { not: null } },
      select: { status: true },
    });

    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(
      (a) => a.status === 'COMPLETED',
    ).length;
    const overallCompletionRate =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

    const activeLearnersCount = await this.prisma.courseAssignment.groupBy({
      by: ['userId'],
      where: { status: 'IN_PROGRESS', userId: { not: null } },
    });

    const quizAttempts = await this.prisma.quizAttempt.aggregate({
      _avg: { score: true },
    });

    const courses = await this.prisma.course.findMany({
      where: { deletedAt: null, isPublished: true },
      select: {
        id: true,
        title: true,
        assignments: {
          where: { userId: { not: null } },
          select: { status: true },
        },
        quizzes: {
          select: {
            attempts: { select: { score: true } },
          },
        },
      },
    });

    const courseCompletionStats = courses.map((c) => {
      const enrolled = c.assignments.length;
      const completed = c.assignments.filter(
        (a) => a.status === 'COMPLETED',
      ).length;
      const allScores = c.quizzes.flatMap((q) => q.attempts.map((a) => a.score));
      return {
        courseId: c.id,
        courseTitle: c.title,
        enrolledCount: enrolled,
        completedCount: completed,
        completionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
        avgQuizScore:
          allScores.length > 0
            ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length)
            : 0,
      };
    });

    return {
      totalUsers,
      totalAgents,
      totalCourses,
      publishedCourses,
      overallCompletionRate,
      activeLearnersCount: activeLearnersCount.length,
      avgQuizScore: Math.round(quizAttempts._avg.score ?? 0),
      courseCompletionStats,
    };
  }

  async getAgentProgress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    const assignments = await this.prisma.courseAssignment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: { select: { id: true } },
            quizzes: {
              select: {
                title: true,
                attempts: {
                  where: { userId },
                  orderBy: { startedAt: 'desc' },
                  take: 1,
                  select: { score: true, passed: true },
                },
              },
            },
          },
        },
      },
    });

    const progress = await this.prisma.lessonProgress.findMany({
      where: { userId, isCompleted: true },
      select: { lessonId: true },
    });
    const completedLessonIds = new Set(progress.map((p) => p.lessonId));

    const allScores = await this.prisma.quizAttempt.aggregate({
      where: { userId },
      _avg: { score: true },
    });

    const courses = assignments.map((a) => {
      const totalLessons = a.course.lessons.length;
      const lessonsCompleted = a.course.lessons.filter((l) =>
        completedLessonIds.has(l.id),
      ).length;
      const progressPct =
        totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

      return {
        courseId: a.course.id,
        courseTitle: a.course.title,
        status: a.status as 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED',
        progressPct,
        lessonsCompleted,
        totalLessons,
        quizScores: a.course.quizzes
          .filter((q) => q.attempts.length > 0)
          .map((q) => ({
            quizTitle: q.title,
            score: q.attempts[0]!.score,
            passed: q.attempts[0]!.passed,
          })),
      };
    });

    const totalAssigned = assignments.length;
    const totalCompleted = assignments.filter((a) => a.status === 'COMPLETED').length;
    const totalInProgress = assignments.filter((a) => a.status === 'IN_PROGRESS').length;
    const overallProgress =
      totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

    return {
      userId,
      userName: user?.name ?? '',
      totalAssigned,
      totalCompleted,
      totalInProgress,
      overallProgress,
      avgQuizScore: Math.round(allScores._avg.score ?? 0),
      courses,
    };
  }

  async getGroupAnalytics(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!group) return null;

    const memberProgress = await Promise.all(
      group.members.map(async (m) => {
        const assignments = await this.prisma.courseAssignment.findMany({
          where: { userId: m.userId },
          select: { status: true },
        });
        const total = assignments.length;
        const completed = assignments.filter((a) => a.status === 'COMPLETED').length;
        const quizScores = await this.prisma.quizAttempt.aggregate({
          where: { userId: m.userId },
          _avg: { score: true },
        });

        return {
          userId: m.user.id,
          userName: m.user.name,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          avgQuizScore: Math.round(quizScores._avg.score ?? 0),
        };
      }),
    );

    const avgCompletionRate =
      memberProgress.length > 0
        ? Math.round(
            memberProgress.reduce((s, m) => s + m.completionRate, 0) / memberProgress.length,
          )
        : 0;
    const avgQuizScore =
      memberProgress.length > 0
        ? Math.round(
            memberProgress.reduce((s, m) => s + m.avgQuizScore, 0) / memberProgress.length,
          )
        : 0;

    return {
      groupId: group.id,
      groupName: group.name,
      memberCount: group.members.length,
      avgCompletionRate,
      avgQuizScore,
      memberProgress,
    };
  }
}

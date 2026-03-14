'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle, Clock, Trophy, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FadeIn, StaggerChildren } from '@/components/animations/fade-in';
import { useAuth } from '@/features/auth/auth-provider';
import { getMyProgress, type AgentProgress } from '@/lib/api/analytics';
import { getMyCourses, type AgentCourse } from '@/lib/api/courses';

type AccentColor = 'blue' | 'green' | 'amber' | 'purple';

function StatCard({ title, value, subtitle, icon: Icon, accent }: {
  title: string; value: string | number; subtitle: string; icon: React.ElementType; accent: AccentColor;
}) {
  return (
    <Card className="stat-card-accent" data-accent={accent}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className="rounded-lg bg-muted/80 p-2"><Icon className="size-4 text-muted-foreground" /></div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<AgentProgress | null>(null);
  const [courses, setCourses] = useState<AgentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyProgress(), getMyCourses()])
      .then(([prog, c]) => {
        setProgress(prog);
        setCourses(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const inProgress = courses.filter((c) => c.status === 'IN_PROGRESS');

  if (loading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48 mt-2" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-9 w-16 mb-2" /><Skeleton className="h-3 w-24" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn duration={500}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Agent'}!
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your learning overview.</p>
        </div>
      </FadeIn>

      <StaggerChildren staggerDelay={80} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'In Progress', value: progress?.totalInProgress ?? 0, subtitle: 'Courses in progress', icon: Clock, accent: 'blue' as AccentColor },
          { title: 'Completed', value: progress?.totalCompleted ?? 0, subtitle: 'Courses completed', icon: CheckCircle, accent: 'green' as AccentColor },
          { title: 'Assigned', value: progress?.totalAssigned ?? 0, subtitle: 'Total assigned courses', icon: BookOpen, accent: 'amber' as AccentColor },
          { title: 'Avg Quiz Score', value: progress?.avgQuizScore ? `${progress.avgQuizScore}%` : '-', subtitle: 'Across all assessments', icon: Trophy, accent: 'purple' as AccentColor },
        ].map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </StaggerChildren>

      {/* Overall progress */}
      <FadeIn delay={200}>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress value={progress?.overallProgress ?? 0} className="h-2.5 flex-1" />
              <span className="text-sm font-semibold w-10 text-right tabular-nums">
                {progress?.overallProgress ?? 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Continue Learning */}
      <FadeIn delay={300}>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Continue Learning</CardTitle>
            <Link href="/dashboard/agent/courses">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {inProgress.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {courses.length === 0
                    ? 'No courses assigned yet. Check back soon!'
                    : 'No courses in progress. Start a new course from your courses page.'}
                </p>
                {courses.length > 0 && (
                  <Link href="/dashboard/agent/courses">
                    <Button variant="outline" size="sm" className="mt-3">
                      Browse Courses
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {inProgress.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={`/dashboard/agent/courses/${course.id}`}
                    className="flex items-center justify-between rounded-lg border p-3.5 hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{course.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {course.completedLessons}/{course.lessonCount} lessons
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <Progress value={course.progressPct} className="h-1.5 w-20" />
                      <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                        {course.progressPct}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

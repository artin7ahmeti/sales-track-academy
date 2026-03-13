'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp, BookOpen, CheckCircle, Clock, Trophy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { getMyProgress, type AgentProgress } from '@/lib/api/analytics';

function StatCard({ title, value, icon: Icon }: {
  title: string; value: string | number; icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-md bg-muted p-2"><Icon className="size-4 text-muted-foreground" /></div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function ProgressPage() {
  const [data, setData] = useState<AgentProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProgress()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-64 mt-2" /></div>
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Progress</h1>
        <p className="text-muted-foreground mt-1">Track your learning journey.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Overall Progress" value={`${data?.overallProgress ?? 0}%`} icon={TrendingUp} />
        <StatCard title="Assigned" value={data?.totalAssigned ?? 0} icon={BookOpen} />
        <StatCard title="Completed" value={data?.totalCompleted ?? 0} icon={CheckCircle} />
        <StatCard title="Avg Quiz Score" value={data?.avgQuizScore ? `${data.avgQuizScore}%` : '-'} icon={Trophy} />
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="size-4" />
            Overall Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Progress value={data?.overallProgress ?? 0} className="h-3 flex-1" />
            <span className="text-sm font-medium w-12 text-right">
              {data?.overallProgress ?? 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Course Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.courses && data.courses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Lessons</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-center">Quiz Scores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.courses.map((course) => {
                  const statusVariant =
                    course.status === 'COMPLETED' ? 'default' as const :
                    course.status === 'IN_PROGRESS' ? 'secondary' as const : 'outline' as const;
                  const statusIcon =
                    course.status === 'COMPLETED' ? CheckCircle :
                    course.status === 'IN_PROGRESS' ? Clock : BookOpen;
                  const StatusIcon = statusIcon;

                  return (
                    <TableRow key={course.courseId}>
                      <TableCell className="font-medium">{course.courseTitle}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusVariant}>
                          <StatusIcon className="size-3 mr-0.5" />
                          {course.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {course.lessonsCompleted}/{course.totalLessons}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={course.progressPct} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {course.progressPct}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {course.quizScores.length > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {course.quizScores.map((qs, i) => (
                              <Badge
                                key={i}
                                variant={qs.passed ? 'default' : 'destructive'}
                              >
                                {qs.score}%
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No courses assigned yet. Your progress will appear here once you start learning.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, Users, TrendingUp, Activity, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrgAnalytics, type OrgAnalytics } from '@/lib/api/analytics';

function StatCard({ title, value, subtitle, icon: Icon }: {
  title: string; value: string | number; subtitle: string; icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-md bg-muted p-2"><Icon className="size-4 text-muted-foreground" /></div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<OrgAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrgAnalytics().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72 mt-2" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-9 w-16 mb-2" /><Skeleton className="h-3 w-24" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Organization-wide training performance overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Agents" value={data?.totalAgents ?? 0} subtitle="Active sales agents" icon={Users} />
        <StatCard title="Published Courses" value={data?.publishedCourses ?? 0} subtitle={`${data?.totalCourses ?? 0} total`} icon={BookOpen} />
        <StatCard title="Completion Rate" value={`${data?.overallCompletionRate ?? 0}%`} subtitle="Overall course completion" icon={TrendingUp} />
        <StatCard title="Avg Quiz Score" value={`${data?.avgQuizScore ?? 0}%`} subtitle="Across all assessments" icon={Trophy} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Active Learners</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">{data?.activeLearnersCount ?? 0}</span>
              <span className="text-sm text-muted-foreground">agents currently learning</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Quick Stats</CardTitle>
            <BarChart3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span className="text-sm">Total Users</span><Badge variant="secondary">{data?.totalUsers ?? 0}</Badge></div>
            <div className="flex justify-between items-center"><span className="text-sm">Total Courses</span><Badge variant="secondary">{data?.totalCourses ?? 0}</Badge></div>
            <div className="flex justify-between items-center"><span className="text-sm">Published</span><Badge variant="secondary">{data?.publishedCourses ?? 0}</Badge></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Course Performance</CardTitle></CardHeader>
        <CardContent>
          {data?.courseCompletionStats && data.courseCompletionStats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Enrolled</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.courseCompletionStats.map((c) => (
                  <TableRow key={c.courseId}>
                    <TableCell className="font-medium">{c.courseTitle}</TableCell>
                    <TableCell className="text-center">{c.enrolledCount}</TableCell>
                    <TableCell className="text-center">{c.completedCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={c.completionRate} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8 text-right">{c.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={c.avgQuizScore >= 80 ? 'default' : 'secondary'}>{c.avgQuizScore}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No course data yet. Publish and assign courses to see analytics.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

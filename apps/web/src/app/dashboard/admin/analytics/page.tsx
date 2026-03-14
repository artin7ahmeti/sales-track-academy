'use client';

import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, Users, TrendingUp, Activity, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FadeIn, StaggerChildren } from '@/components/animations/fade-in';
import { getOrgAnalytics, type OrgAnalytics } from '@/lib/api/analytics';

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
      <FadeIn duration={500}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Organization-wide training performance overview.</p>
        </div>
      </FadeIn>

      <StaggerChildren staggerDelay={80} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Agents', value: data?.totalAgents ?? 0, subtitle: 'Active sales agents', icon: Users, accent: 'blue' as AccentColor },
          { title: 'Published Courses', value: data?.publishedCourses ?? 0, subtitle: `${data?.totalCourses ?? 0} total`, icon: BookOpen, accent: 'green' as AccentColor },
          { title: 'Completion Rate', value: `${data?.overallCompletionRate ?? 0}%`, subtitle: 'Overall course completion', icon: TrendingUp, accent: 'amber' as AccentColor },
          { title: 'Avg Quiz Score', value: `${data?.avgQuizScore ?? 0}%`, subtitle: 'Across all assessments', icon: Trophy, accent: 'purple' as AccentColor },
        ].map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </StaggerChildren>

      <FadeIn delay={200}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Active Learners</CardTitle>
              <Activity className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold tracking-tighter">{data?.activeLearnersCount ?? 0}</span>
                <span className="text-sm text-muted-foreground">agents currently learning</span>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Quick Stats</CardTitle>
              <BarChart3 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Total Users', value: data?.totalUsers ?? 0 },
                { label: 'Total Courses', value: data?.totalCourses ?? 0 },
                { label: 'Published', value: data?.publishedCourses ?? 0 },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <Badge variant="secondary" className="tabular-nums">{item.value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <Card className="hover:shadow-md transition-shadow">
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
                    <TableRow key={c.courseId} className="group/row">
                      <TableCell className="font-medium">{c.courseTitle}</TableCell>
                      <TableCell className="text-center tabular-nums">{c.enrolledCount}</TableCell>
                      <TableCell className="text-center tabular-nums">{c.completedCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={c.completionRate} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{c.completionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={c.avgQuizScore >= 80 ? 'default' : 'secondary'} className="tabular-nums">
                          {c.avgQuizScore}%
                        </Badge>
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
      </FadeIn>
    </div>
  );
}

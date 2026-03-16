'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart3, BookOpen, Users, TrendingUp, Activity, Trophy,
  User, ArrowLeft, CheckCircle, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/components/ui/select';
import { FadeIn, StaggerChildren } from '@/components/animations/fade-in';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useThumbnailUrl } from '@/hooks/use-thumbnail-url';
import { getOrgAnalytics, getAgentProgress, type OrgAnalytics, type AgentProgress } from '@/lib/api/analytics';
import { getUsers, type User as UserType } from '@/lib/api/users';

function AgentAvatar({ avatarUrl, name, className }: { avatarUrl: string | null; name: string; className?: string }) {
  const url = useThumbnailUrl(avatarUrl);
  return (
    <Avatar className={className ?? 'size-10'}>
      {url ? <AvatarImage src={url} alt={name} /> : null}
      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

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

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  COMPLETED: { label: 'Completed', variant: 'default' },
  IN_PROGRESS: { label: 'In Progress', variant: 'secondary' },
  ASSIGNED: { label: 'Not Started', variant: 'outline' },
};

function AgentDetailView({ agent, avatarUrl, onBack }: { agent: AgentProgress; avatarUrl: string | null; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <FadeIn duration={400}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <AgentAvatar avatarUrl={avatarUrl} name={agent.userName} />
            <div>
              <h2 className="text-lg font-bold tracking-tight">{agent.userName}</h2>
              <p className="text-sm text-muted-foreground">Individual performance breakdown</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Overall progress */}
      <FadeIn delay={50}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-2xl font-bold tabular-nums">{agent.overallProgress}%</span>
            </div>
            <Progress value={agent.overallProgress} className="h-2" />
          </CardContent>
        </Card>
      </FadeIn>

      {/* Stat cards */}
      <StaggerChildren staggerDelay={60} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Assigned', value: agent.totalAssigned, subtitle: 'Total courses', icon: BookOpen, accent: 'blue' as AccentColor },
          { title: 'Completed', value: agent.totalCompleted, subtitle: `of ${agent.totalAssigned} courses`, icon: CheckCircle, accent: 'green' as AccentColor },
          { title: 'In Progress', value: agent.totalInProgress, subtitle: 'Currently active', icon: Clock, accent: 'amber' as AccentColor },
          { title: 'Avg Quiz Score', value: `${agent.avgQuizScore}%`, subtitle: 'Across all quizzes', icon: Trophy, accent: 'purple' as AccentColor },
        ].map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </StaggerChildren>

      {/* Course breakdown */}
      <FadeIn delay={200}>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Course Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {agent.courses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-center">Lessons</TableHead>
                    <TableHead>Quiz Scores</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agent.courses.map((course) => {
                    const status = statusConfig[course.status] ?? statusConfig.ASSIGNED!;
                    return (
                      <TableRow key={course.courseId}>
                        <TableCell className="font-medium">{course.courseTitle}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={course.progressPct} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{course.progressPct}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          {course.lessonsCompleted}/{course.totalLessons}
                        </TableCell>
                        <TableCell>
                          {course.quizScores.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {course.quizScores.map((qs, i) => (
                                <Badge
                                  key={i}
                                  variant={qs.passed ? 'default' : 'secondary'}
                                  className="text-xs tabular-nums"
                                  title={qs.quizTitle}
                                >
                                  {qs.quizTitle.length > 15
                                    ? qs.quizTitle.slice(0, 15) + '...'
                                    : qs.quizTitle}: {qs.score}%
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No attempts</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No courses assigned to this agent yet.
              </p>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<OrgAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Agent individual view
  const [agents, setAgents] = useState<UserType[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<AgentProgress | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [orgResult, usersResult] = await Promise.allSettled([
        getOrgAnalytics(),
        getUsers({ role: 'AGENT', limit: 100 }),
      ]);
      if (orgResult.status === 'fulfilled') setData(orgResult.value);
      if (usersResult.status === 'fulfilled') setAgents(usersResult.value.data);
      setLoading(false);
    }
    load();
  }, []);

  const loadAgentData = useCallback(async (agentId: string) => {
    setAgentLoading(true);
    try {
      const progress = await getAgentProgress(agentId);
      setAgentData(progress);
    } catch {
      setAgentData(null);
    } finally {
      setAgentLoading(false);
    }
  }, []);

  function handleSelectAgent(value: string | null) {
    if (!value) {
      setSelectedAgentId(null);
      setAgentData(null);
      return;
    }
    setSelectedAgentId(value);
    loadAgentData(value);
  }

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

  // Show agent detail view
  if (selectedAgentId && agentData && !agentLoading) {
    return (
      <div className="space-y-8">
        <FadeIn duration={500}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">Individual agent performance breakdown.</p>
          </div>
        </FadeIn>
        <AgentDetailView
          agent={agentData}
          avatarUrl={agents.find((a) => a.id === selectedAgentId)?.avatarUrl ?? null}
          onBack={() => {
            setSelectedAgentId(null);
            setAgentData(null);
          }}
        />
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
        <div className="grid gap-4 lg:grid-cols-3">
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
          <Card className="group hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Agent Performance</CardTitle>
              <User className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Select
                value={selectedAgentId}
                onValueChange={handleSelectAgent}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an agent..." />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      <div className="flex items-center gap-2">
                        <AgentAvatar avatarUrl={a.avatarUrl} name={a.name} className="size-5" />
                        <span>{a.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {agentLoading && (
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              )}
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

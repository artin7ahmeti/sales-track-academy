'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMyCourses, type AgentCourse } from '@/lib/api/courses';

function CourseCard({ course }: { course: AgentCourse }) {
  const statusLabel =
    course.status === 'COMPLETED' ? 'Completed' :
    course.status === 'IN_PROGRESS' ? 'In Progress' : 'Assigned';
  const statusVariant =
    course.status === 'COMPLETED' ? 'default' as const :
    course.status === 'IN_PROGRESS' ? 'secondary' as const : 'outline' as const;

  return (
    <Link href={`/dashboard/agent/courses/${course.id}`}>
      <Card className="hover:bg-muted/30 transition-colors h-full">
        <CardContent className="pt-5 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">{course.title}</h3>
            <Badge variant={statusVariant} className="shrink-0">{statusLabel}</Badge>
          </div>
          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
          )}
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{course.completedLessons}/{course.lessonCount} lessons</span>
              <span>{course.progressPct}%</span>
            </div>
            <Progress value={course.progressPct} className="h-1.5" />
            <div className="flex items-center justify-between">
              {course.dueDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  Due {new Date(course.dueDate).toLocaleDateString()}
                </span>
              )}
              <Button variant="ghost" size="xs" className="ml-auto">
                {course.status === 'ASSIGNED' ? 'Start' : course.status === 'COMPLETED' ? 'Review' : 'Continue'}
                <ArrowRight className="size-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <BookOpen className="size-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}

export default function AgentCoursesPage() {
  const [courses, setCourses] = useState<AgentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-64 mt-2" /></div>
        <Skeleton className="h-8 w-80" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  const assigned = courses.filter((c) => c.status === 'ASSIGNED');
  const inProgress = courses.filter((c) => c.status === 'IN_PROGRESS');
  const completed = courses.filter((c) => c.status === 'COMPLETED');

  function renderGrid(list: AgentCourse[], emptyMsg: string) {
    if (list.length === 0) return <EmptyState message={emptyMsg} />;
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">Browse and continue your assigned courses.</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({courses.length})</TabsTrigger>
          <TabsTrigger value="assigned">Assigned ({assigned.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {renderGrid(courses, 'No courses assigned yet. Check back soon!')}
        </TabsContent>
        <TabsContent value="assigned">
          {renderGrid(assigned, 'No new assigned courses.')}
        </TabsContent>
        <TabsContent value="in-progress">
          {renderGrid(inProgress, 'No courses in progress.')}
        </TabsContent>
        <TabsContent value="completed">
          {renderGrid(completed, 'No completed courses yet.')}
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Video, Headphones, FileText, Type,
  CheckCircle, ClipboardList, Trophy, XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { getCourse, type CourseDetail } from '@/lib/api/courses';
import { getQuizzes, getAttempts, type Quiz } from '@/lib/api/quizzes';
import { toast } from 'sonner';

const typeIcons: Record<string, React.ElementType> = {
  VIDEO: Video,
  AUDIO: Headphones,
  PDF: FileText,
  TEXT: Type,
};

function formatDuration(sec: number | null) {
  if (!sec) return '';
  const mins = Math.round(sec / 60);
  return mins > 0 ? `${mins} min` : '<1 min';
}

export default function AgentCourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<Record<string, { score: number; passed: boolean } | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [courseData, quizData] = await Promise.all([
          getCourse(courseId),
          getQuizzes(courseId),
        ]);
        setCourse(courseData);
        setQuizzes(quizData);

        // Fetch latest attempts for each quiz
        const attempts: Record<string, { score: number; passed: boolean } | null> = {};
        await Promise.all(
          quizData.map(async (q) => {
            try {
              const att = await getAttempts(courseId, q.id);
              attempts[q.id] = att.length > 0 ? att[att.length - 1]! : null;
            } catch {
              attempts[q.id] = null;
            }
          }),
        );
        setQuizAttempts(attempts);
      } catch {
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-2 w-full" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Course not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/agent/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  const sortedLessons = [...course.lessons].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push('/dashboard/agent/courses')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          {course.description && (
            <p className="text-muted-foreground mt-1">{course.description}</p>
          )}
        </div>
      </div>

      {/* Lessons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="size-4" />
            Lessons ({sortedLessons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No lessons in this course yet.</p>
          ) : (
            <div className="space-y-1">
              {sortedLessons.map((lesson, idx) => {
                const Icon = typeIcons[lesson.type] || Type;
                return (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/agent/courses/${courseId}/lessons/${lesson.id}`}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground w-5 text-right">{idx + 1}</span>
                    <div className="rounded bg-muted p-1.5">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                      {lesson.durationSec && (
                        <p className="text-xs text-muted-foreground">{formatDuration(lesson.durationSec)}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">{lesson.type}</Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="size-4" />
              Quizzes ({quizzes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {quizzes.map((quiz) => {
                const attempt = quizAttempts[quiz.id];
                return (
                  <Link
                    key={quiz.id}
                    href={`/dashboard/agent/courses/${courseId}/quizzes/${quiz.id}`}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="rounded bg-muted p-1.5">
                      <ClipboardList className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{quiz.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {quiz.questionCount} questions &middot; Pass: {quiz.passingScore}%
                      </p>
                    </div>
                    {attempt ? (
                      <Badge variant={attempt.passed ? 'default' : 'destructive'}>
                        {attempt.passed ? (
                          <CheckCircle className="size-3 mr-0.5" />
                        ) : (
                          <XCircle className="size-3 mr-0.5" />
                        )}
                        {attempt.score}%
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Attempted</Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

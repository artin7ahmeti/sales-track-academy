'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Video, Headphones, FileText, Type,
  CheckCircle, Lock, ClipboardList,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getCourse, type CourseDetail } from '@/lib/api/courses';
import { getLessonProgress } from '@/lib/api/lessons';
import { getQuizzes, type Quiz } from '@/lib/api/quizzes';
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
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, { isCompleted: boolean; progressPct: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [courseData, quizData, progressData] = await Promise.all([
          getCourse(courseId),
          getQuizzes(courseId),
          getLessonProgress(courseId).catch(() => ({})),
        ]);
        setCourse(courseData);
        setQuizzes(quizData);
        setLessonProgressMap(progressData);
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

  // Build a map of lessonId → quiz for lessons that have linked quizzes
  const lessonQuizMap = new Map<string, Quiz>();
  for (const q of quizzes) {
    if (q.lessonId) lessonQuizMap.set(q.lessonId, q);
  }

  // Determine which lessons are unlocked:
  // - First lesson is always unlocked
  // - Subsequent lessons require the previous lesson to be completed
  //   (if it has a linked quiz, the quiz must be passed)
  function isLessonUnlocked(idx: number): boolean {
    if (idx === 0) return true;
    const prevLesson = sortedLessons[idx - 1]!;
    const prevProgress = lessonProgressMap[prevLesson.id];
    return prevProgress?.isCompleted === true;
  }

  function isLessonCompleted(lessonId: string): boolean {
    return lessonProgressMap[lessonId]?.isCompleted === true;
  }

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
                const unlocked = isLessonUnlocked(idx);
                const completed = isLessonCompleted(lesson.id);
                const linkedQuiz = lessonQuizMap.get(lesson.id);

                if (!unlocked) {
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-lg border px-3 py-2.5 opacity-50 cursor-not-allowed"
                    >
                      <span className="text-xs text-muted-foreground w-5 text-right">{idx + 1}</span>
                      <div className="rounded bg-muted p-1.5">
                        <Lock className="size-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">Complete previous lesson to unlock</p>
                      </div>
                      <Badge variant="outline" className="text-xs">Locked</Badge>
                    </div>
                  );
                }

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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {lesson.durationSec && <span>{formatDuration(lesson.durationSec)}</span>}
                        {linkedQuiz && (
                          <span className="flex items-center gap-0.5">
                            <ClipboardList className="size-3" />
                            Quiz
                          </span>
                        )}
                      </div>
                    </div>
                    {completed ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="size-3 mr-0.5" />
                        Complete
                      </Badge>
                    ) : linkedQuiz ? (
                      <Badge variant="outline" className="text-xs">Quiz Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">{lesson.type}</Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

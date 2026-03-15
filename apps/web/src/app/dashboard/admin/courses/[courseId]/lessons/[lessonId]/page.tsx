'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Video, Headphones, FileText, Type, Pencil,
  ClipboardList, Plus, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { FadeIn } from '@/components/animations/fade-in';
import { getLesson, getLessons, type Lesson } from '@/lib/api/lessons';
import { getQuizByLesson, type QuizDetail } from '@/lib/api/quizzes';
import { LessonFormDialog } from '@/features/admin/lesson-form-dialog';
import { LessonContentViewer } from '@/features/shared/lesson-content-viewer';
import { CommentSection } from '@/features/shared/comment-section';
import { QuizFormDialog } from '@/features/admin/quiz-form-dialog';

export default function AdminLessonViewPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const { courseId, lessonId } = params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [quizFormOpen, setQuizFormOpen] = useState(false);

  function fetchData() {
    setLoading(true);
    Promise.all([
      getLesson(courseId, lessonId),
      getLessons(courseId),
      getQuizByLesson(courseId, lessonId),
    ])
      .then(([l, all, q]) => {
        setLesson(l);
        setAllLessons(all.sort((a, b) => a.sortOrder - b.sortOrder));
        setQuiz(q);
      })
      .catch(() => toast.error('Failed to load lesson'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push(`/dashboard/admin/courses/${courseId}`)}>
          Back to Course
        </Button>
      </div>
    );
  }

  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const typeLabel: Record<string, string> = { VIDEO: 'Video', AUDIO: 'Audio', PDF: 'PDF', TEXT: 'Text' };
  const TypeIcon = { VIDEO: Video, AUDIO: Headphones, PDF: FileText, TEXT: Type }[lesson.type] || Type;

  const durationMin = lesson.durationSec ? Math.round(lesson.durationSec / 60) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <FadeIn duration={400}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push(`/dashboard/admin/courses/${courseId}`)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">{lesson.title}</h1>
                <Badge variant="secondary">
                  <TypeIcon className="size-3 mr-0.5" />
                  {typeLabel[lesson.type] || lesson.type}
                </Badge>
                {durationMin != null && (
                  <span className="text-xs text-muted-foreground">
                    {durationMin > 0 ? `${durationMin} min` : '<1 min'}
                  </span>
                )}
              </div>
              {lesson.description && (
                <p className="text-muted-foreground text-sm mt-1">{lesson.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </FadeIn>

      {/* Content */}
      <FadeIn delay={100} duration={500}>
        <LessonContentViewer
          type={lesson.type}
          content={lesson.content as Record<string, unknown>}
        />
      </FadeIn>

      {/* Quiz Section */}
      <FadeIn delay={150} duration={500}>
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Lesson Quiz</h2>
            </div>
            {quiz ? (
              <Button variant="outline" size="sm" onClick={() => setQuizFormOpen(true)}>
                <Pencil className="size-3.5 mr-1" />
                Edit Quiz
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setQuizFormOpen(true)}>
                <Plus className="size-3.5 mr-1" />
                Add Quiz
              </Button>
            )}
          </div>

          {quiz ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{quiz.title}</span>
                <Badge variant="secondary">{quiz.passingScore}% to pass</Badge>
                <span>{quiz.questionCount} question{quiz.questionCount !== 1 ? 's' : ''}</span>
              </div>
              {quiz.questions.map((q, qi) => (
                <div key={q.id} className="rounded border p-3 space-y-2">
                  <p className="text-sm font-medium">
                    {qi + 1}. {q.text}
                  </p>
                  <div className="space-y-1 pl-4">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`text-sm flex items-center gap-2 rounded px-2 py-0.5 ${
                          opt.isCorrect
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {opt.isCorrect && <CheckCircle className="size-3.5 shrink-0" />}
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No quiz attached. Agents will use &quot;Mark as Complete&quot; for this lesson.
            </p>
          )}
        </div>
      </FadeIn>

      {/* Navigation between lessons */}
      <div className="flex items-center justify-between border-t pt-4">
        {prevLesson ? (
          <Link href={`/dashboard/admin/courses/${courseId}/lessons/${prevLesson.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4 mr-1" />
              Previous
            </Button>
          </Link>
        ) : <div />}
        <span className="text-xs text-muted-foreground">
          {currentIdx + 1} of {allLessons.length}
        </span>
        {nextLesson ? (
          <Link href={`/dashboard/admin/courses/${courseId}/lessons/${nextLesson.id}`}>
            <Button variant="outline" size="sm">
              Next
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        ) : (
          <Link href={`/dashboard/admin/courses/${courseId}`}>
            <Button size="sm">
              Back to Course
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      {/* Comments */}
      <FadeIn delay={200}>
        <CommentSection lessonId={lessonId} />
      </FadeIn>

      {/* Edit Lesson Dialog */}
      <LessonFormDialog
        courseId={courseId}
        lesson={lesson}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={fetchData}
      />

      {/* Quiz Form Dialog */}
      <QuizFormDialog
        courseId={courseId}
        quiz={quiz}
        lessonId={lessonId}
        open={quizFormOpen}
        onOpenChange={setQuizFormOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}

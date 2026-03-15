'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CheckCircle, Video,
  Headphones, FileText, Type, XCircle, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getLesson, getLessons, updateProgress, type Lesson } from '@/lib/api/lessons';
import { getQuizByLesson, submitQuiz, getAttempts, type QuizDetail, type QuizResult } from '@/lib/api/quizzes';
import { LessonContentViewer } from '@/features/shared/lesson-content-viewer';
import { CommentSection } from '@/features/shared/comment-section';

export default function LessonViewerPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const { courseId, lessonId } = params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const progressSent = useRef(false);

  // Quiz state
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [attempts, setAttempts] = useState<{ id: string; score: number; passed: boolean; startedAt: string }[]>([]);

  useEffect(() => {
    progressSent.current = false;
    setQuizResult(null);
    setAnswers({});
    Promise.all([
      getLesson(courseId, lessonId),
      getLessons(courseId),
      getQuizByLesson(courseId, lessonId),
    ])
      .then(([l, all, q]) => {
        setLesson(l);
        setAllLessons(all.sort((a, b) => a.sortOrder - b.sortOrder));
        setQuiz(q);
        if (q) {
          getAttempts(courseId, q.id).then(setAttempts).catch(() => {});
        }
      })
      .catch(() => toast.error('Failed to load lesson'))
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  async function markComplete() {
    if (progressSent.current) return;
    setCompleting(true);
    try {
      await updateProgress(courseId, lessonId, { progressPct: 100 });
      progressSent.current = true;
      toast.success('Lesson marked as complete');
    } catch {
      toast.error('Failed to update progress');
    } finally {
      setCompleting(false);
    }
  }

  async function handleSubmitQuiz() {
    if (!quiz) return;
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`);
      return;
    }
    setSubmittingQuiz(true);
    try {
      const result = await submitQuiz(courseId, quiz.id, answers);
      setQuizResult(result);
      if (result.passed) {
        progressSent.current = true;
        toast.success(`Passed with ${result.score}%! Lesson complete.`);
      } else {
        toast.error(`Score: ${result.score}%. You need ${quiz.passingScore}% to pass.`);
      }
      const updated = await getAttempts(courseId, quiz.id);
      setAttempts(updated);
    } catch {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  }

  function resetQuiz() {
    setQuizResult(null);
    setAnswers({});
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push(`/dashboard/agent/courses/${courseId}`)}>
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

  const hasPassed = attempts.some((a) => a.passed);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push(`/dashboard/agent/courses/${courseId}`)}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{lesson.title}</h1>
            <Badge variant="secondary">
              <TypeIcon className="size-3 mr-0.5" />
              {typeLabel[lesson.type] || lesson.type}
            </Badge>
          </div>
          {lesson.description && (
            <p className="text-muted-foreground text-sm mt-1">{lesson.description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <LessonContentViewer
        type={lesson.type}
        content={lesson.content as Record<string, unknown>}
      />

      {/* Quiz or Mark Complete */}
      {quiz ? (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{quiz.title}</h2>
            <Badge variant="secondary">{quiz.passingScore}% to pass</Badge>
          </div>

          {quizResult ? (
            // Show result
            <div className="space-y-4">
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                quizResult.passed
                  ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {quizResult.passed ? (
                  <CheckCircle className="size-5" />
                ) : (
                  <XCircle className="size-5" />
                )}
                <span className="font-medium">
                  {quizResult.passed
                    ? `Passed! Score: ${quizResult.score}%`
                    : `Failed. Score: ${quizResult.score}% (need ${quiz.passingScore}%)`}
                </span>
              </div>

              {/* Show answers */}
              {quiz.questions.map((q, qi) => {
                const userAnswer = quizResult.userAnswers[q.id];
                const correctAnswer = quizResult.correctAnswers[q.id];
                return (
                  <div key={q.id} className="rounded border p-3 space-y-2">
                    <p className="text-sm font-medium">{qi + 1}. {q.text}</p>
                    <div className="space-y-1 pl-4">
                      {q.options.map((opt) => {
                        const isUserChoice = opt.id === userAnswer;
                        const isCorrect = opt.id === correctAnswer;
                        let className = 'text-sm flex items-center gap-2 rounded px-2 py-0.5 ';
                        if (isCorrect) {
                          className += 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400';
                        } else if (isUserChoice && !isCorrect) {
                          className += 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 line-through';
                        } else {
                          className += 'text-muted-foreground';
                        }
                        return (
                          <div key={opt.id} className={className}>
                            {isCorrect && <CheckCircle className="size-3.5 shrink-0" />}
                            {isUserChoice && !isCorrect && <XCircle className="size-3.5 shrink-0" />}
                            <span>{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {!quizResult.passed && (
                <div className="flex justify-center">
                  <Button onClick={resetQuiz} variant="outline">
                    <RotateCcw className="size-4 mr-1" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          ) : hasPassed ? (
            // Already passed previously
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle className="size-5" />
              <span className="font-medium">You have already passed this quiz.</span>
            </div>
          ) : (
            // Show quiz questions for answering
            <div className="space-y-4">
              {quiz.questions.map((q, qi) => (
                <div key={q.id} className="rounded border p-3 space-y-2">
                  <p className="text-sm font-medium">{qi + 1}. {q.text}</p>
                  <div className="space-y-1 pl-4">
                    {q.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`text-sm flex items-center gap-2 rounded px-2 py-1 cursor-pointer hover:bg-muted/50 transition-colors ${
                          answers[q.id] === opt.id ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                          className="accent-primary"
                        />
                        {opt.text}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-center">
                <Button onClick={handleSubmitQuiz} disabled={submittingQuiz}>
                  {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              </div>
            </div>
          )}

          {/* Previous attempts */}
          {attempts.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Previous Attempts</p>
              <div className="space-y-1">
                {attempts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {new Date(a.startedAt).toLocaleDateString()} {new Date(a.startedAt).toLocaleTimeString()}
                    </span>
                    <Badge variant={a.passed ? 'default' : 'secondary'} className="text-xs">
                      {a.score}% — {a.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // No quiz — show mark as complete
        <div className="flex justify-center">
          <Button onClick={markComplete} disabled={completing || progressSent.current}>
            <CheckCircle className="size-4 mr-1" />
            {progressSent.current ? 'Completed' : completing ? 'Marking...' : 'Mark as Complete'}
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-4">
        {prevLesson ? (
          <Link href={`/dashboard/agent/courses/${courseId}/lessons/${prevLesson.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4 mr-1" />
              Previous
            </Button>
          </Link>
        ) : <div />}
        {nextLesson ? (
          <Link href={`/dashboard/agent/courses/${courseId}/lessons/${nextLesson.id}`}>
            <Button variant="outline" size="sm">
              Next
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        ) : (
          <Link href={`/dashboard/agent/courses/${courseId}`}>
            <Button size="sm">
              Back to Course
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      {/* Comments */}
      <CommentSection lessonId={lessonId} />
    </div>
  );
}

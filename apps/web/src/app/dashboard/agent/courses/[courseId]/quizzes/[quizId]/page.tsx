'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  getQuiz, submitQuiz, getAttempts,
  type QuizDetail, type QuizResult,
} from '@/lib/api/quizzes';

export default function QuizTakerPage() {
  const params = useParams<{ courseId: string; quizId: string }>();
  const router = useRouter();
  const { courseId, quizId } = params;

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [attempts, setAttempts] = useState<{ id: string; score: number; passed: boolean; completedAt: string | null }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [q, att] = await Promise.all([
          getQuiz(courseId, quizId),
          getAttempts(courseId, quizId),
        ]);
        setQuiz(q);
        setAttempts(att);
      } catch {
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, quizId]);

  function selectAnswer(questionId: string, optionId: string) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    if (!quiz) return;
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitQuiz(courseId, quizId, answers);
      setResult(res);
      const att = await getAttempts(courseId, quizId);
      setAttempts(att);
      if (res.passed) {
        toast.success('Congratulations! You passed!');
      } else {
        toast.error('You did not pass. Try again!');
      }
    } catch {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }

  function tryAgain() {
    setResult(null);
    setAnswers({});
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Quiz not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push(`/dashboard/agent/courses/${courseId}`)}>
          Back to Course
        </Button>
      </div>
    );
  }

  const sortedQuestions = [...quiz.questions].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
          <h1 className="text-xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {quiz.questions.length} questions &middot; Passing score: {quiz.passingScore}%
          </p>
        </div>
      </div>

      {/* Result Banner */}
      {result && (
        <Card className={result.passed ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              {result.passed ? (
                <Trophy className="size-8 text-green-600" />
              ) : (
                <XCircle className="size-8 text-red-500" />
              )}
              <div>
                <p className="font-semibold">
                  {result.passed ? 'You Passed!' : 'Not Quite'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Score: {result.score}% (needed {quiz.passingScore}%)
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!result.passed && (
                <Button variant="outline" size="sm" onClick={tryAgain}>
                  <RotateCcw className="size-4 mr-1" />
                  Try Again
                </Button>
              )}
              <Link href={`/dashboard/agent/courses/${courseId}`}>
                <Button size="sm">Back to Course</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      {sortedQuestions.map((question, qi) => {
        const sortedOptions = [...question.options].sort((a, b) => a.sortOrder - b.sortOrder);
        return (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                <span className="text-muted-foreground mr-2">Q{qi + 1}.</span>
                {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedOptions.map((option) => {
                  const isSelected = answers[question.id] === option.id;
                  const showResult = !!result;
                  const isCorrect = showResult && option.isCorrect;
                  const isWrong = showResult && isSelected && !option.isCorrect;

                  let borderClass = 'border';
                  if (isCorrect) borderClass = 'border-green-500 bg-green-50/50 dark:bg-green-950/20';
                  else if (isWrong) borderClass = 'border-red-500 bg-red-50/50 dark:bg-red-950/20';
                  else if (isSelected && !showResult) borderClass = 'border-primary bg-primary/5';

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!!result}
                      onClick={() => selectAnswer(question.id, option.id)}
                      className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${borderClass} ${!result ? 'hover:bg-muted/50 cursor-pointer' : ''}`}
                    >
                      <div className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-xs ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground/30'}`}>
                        {isSelected && !showResult && <div className="size-2 rounded-full bg-current" />}
                        {showResult && isCorrect && <CheckCircle className="size-3.5 text-green-600" />}
                        {showResult && isWrong && <XCircle className="size-3.5 text-red-500" />}
                      </div>
                      <span className="flex-1">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Submit */}
      {!result && (
        <div className="flex justify-center">
          <Button onClick={handleSubmit} disabled={submitting} size="lg">
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </div>
      )}

      {/* Previous Attempts */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Previous Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attempts.map((att, i) => (
                <div key={att.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Attempt {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={att.passed ? 'default' : 'destructive'}>
                      {att.score}%
                    </Badge>
                    {att.passed ? (
                      <CheckCircle className="size-4 text-green-600" />
                    ) : (
                      <XCircle className="size-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

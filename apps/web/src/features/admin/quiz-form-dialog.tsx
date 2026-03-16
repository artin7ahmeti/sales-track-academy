'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createQuiz, updateQuiz, type CreateQuizData, type QuizDetail } from '@/lib/api/quizzes';

interface CourseLessonOption {
  id: string;
  title: string;
}

interface QuizFormDialogProps {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  quiz?: QuizDetail | null;
  lessonId?: string;
  lessons?: CourseLessonOption[];
  linkedLessonIds?: string[];
}

interface QuestionDraft {
  text: string;
  options: { text: string; isCorrect: boolean }[];
}

function emptyQuestion(): QuestionDraft {
  return { text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] };
}

function quizToQuestions(quiz: QuizDetail): QuestionDraft[] {
  return quiz.questions.map((q) => ({
    text: q.text,
    options: q.options.map((o) => ({ text: o.text, isCorrect: !!o.isCorrect })),
  }));
}

export function QuizFormDialog({
  courseId, open, onOpenChange, onSuccess, quiz, lessonId,
  lessons = [], linkedLessonIds = [],
}: QuizFormDialogProps) {
  const isEditing = !!quiz;
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [submitting, setSubmitting] = useState(false);

  // Lessons available for linking: exclude those already linked (unless it's the lesson this quiz is already linked to)
  const availableLessons = lessons.filter(
    (l) => !linkedLessonIds.includes(l.id) || (quiz && quiz.lessonId === l.id),
  );

  useEffect(() => {
    if (open) {
      if (quiz) {
        setTitle(quiz.title);
        setPassingScore(String(quiz.passingScore));
        setSelectedLessonId(quiz.lessonId || '');
        setQuestions(quizToQuestions(quiz));
      } else {
        setTitle('');
        setPassingScore('70');
        setSelectedLessonId(lessonId || '');
        setQuestions([emptyQuestion()]);
      }
    }
  }, [open, quiz, lessonId]);

  function updateQuestion(qi: number, field: string, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, [field]: value } : q)),
    );
  }

  function updateOption(qi: number, oi: number, field: string, value: string | boolean) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const opts = q.options.map((o, j) => {
          if (j !== oi) return field === 'isCorrect' && value === true ? { ...o, isCorrect: false } : o;
          return { ...o, [field]: value };
        });
        return { ...q, options: opts };
      }),
    );
  }

  function addOption(qi: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, { text: '', isCorrect: false }] } : q,
      ),
    );
  }

  function removeOption(qi: number, oi: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q,
      ),
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(qi: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  }

  function validate(): boolean {
    if (!title.trim()) { toast.error('Title is required'); return false; }
    const score = parseInt(passingScore);
    if (isNaN(score) || score < 1 || score > 100) { toast.error('Passing score must be 1-100'); return false; }
    if (questions.length === 0) { toast.error('Add at least one question'); return false; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      if (!q.text.trim()) { toast.error(`Question ${i + 1} needs text`); return false; }
      if (q.options.length < 2) { toast.error(`Question ${i + 1} needs at least 2 options`); return false; }
      if (!q.options.some((o) => o.isCorrect)) { toast.error(`Question ${i + 1} needs a correct answer`); return false; }
      if (q.options.some((o) => !o.text.trim())) { toast.error(`Question ${i + 1} has empty options`); return false; }
    }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateQuiz(courseId, quiz.id, {
          title,
          passingScore: parseInt(passingScore),
          lessonId: selectedLessonId || null,
          questions: questions.map((q) => ({
            text: q.text,
            options: q.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
            })),
          })),
        });
        toast.success('Quiz updated');
      } else {
        const data: CreateQuizData = {
          title,
          passingScore: parseInt(passingScore),
          questions: questions.map((q, qi) => ({
            text: q.text,
            sortOrder: qi,
            options: q.options.map((o, oi) => ({
              text: o.text,
              sortOrder: oi,
              isCorrect: o.isCorrect,
            })),
          })),
        };
        await createQuiz(courseId, data, selectedLessonId || undefined);
        toast.success('Quiz created');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(isEditing ? 'Failed to update quiz' : 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Quiz' : 'Create Quiz'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update quiz questions and settings.' : 'Build a quiz with multiple-choice questions.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Title</Label>
            <Input
              id="quiz-title"
              placeholder="e.g. Module 1 Assessment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiz-lesson">Linked Lesson</Label>
              <select
                id="quiz-lesson"
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">No linked lesson</option>
                {availableLessons.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Agents must pass this quiz to complete the linked lesson.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-score">Passing Score (%)</Label>
              <Input
                id="quiz-score"
                type="number"
                min="1"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Questions</Label>
              <Button variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="size-4 mr-1" />
                Add Question
              </Button>
            </div>

            {questions.map((q, qi) => (
              <div
                key={qi}
                className="rounded-lg border p-3 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Question {qi + 1}
                  </Label>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeQuestion(qi)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Question text..."
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, 'text', e.target.value)}
                />
                <div className="space-y-2 pl-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={opt.isCorrect}
                        onChange={() => updateOption(qi, oi, 'isCorrect', true)}
                        className="accent-primary"
                      />
                      <Input
                        className="flex-1 h-7 text-sm"
                        placeholder={`Option ${oi + 1}`}
                        value={opt.text}
                        onChange={(e) => updateOption(qi, oi, 'text', e.target.value)}
                      />
                      {q.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => removeOption(qi, oi)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => addOption(qi)}
                    className="text-muted-foreground"
                  >
                    <Plus className="size-3 mr-1" />
                    Add Option
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Quiz' : 'Create Quiz')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

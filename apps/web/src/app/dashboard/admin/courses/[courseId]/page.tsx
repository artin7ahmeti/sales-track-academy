'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Plus, ChevronUp, ChevronDown,
  Trash2, Video, Headphones, FileText, Type,
  ClipboardList, Users, Eye, Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getCourse, type CourseDetail } from '@/lib/api/courses';
import { deleteLesson, reorderLessons } from '@/lib/api/lessons';
import { deleteQuiz, getQuiz, type QuizDetail } from '@/lib/api/quizzes';
import { LessonFormDialog } from '@/features/admin/lesson-form-dialog';
import { QuizFormDialog } from '@/features/admin/quiz-form-dialog';
import { AssignCourseDialog } from '@/features/admin/assign-course-dialog';

const typeIcons: Record<string, React.ElementType> = {
  VIDEO: Video,
  AUDIO: Headphones,
  PDF: FileText,
  TEXT: Type,
};

function formatDuration(sec: number | null) {
  if (!sec) return '-';
  const mins = Math.round(sec / 60);
  return mins > 0 ? `${mins} min` : '<1 min';
}

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Lesson form
  const [lessonFormOpen, setLessonFormOpen] = useState(false);

  // Quiz form
  const [quizFormOpen, setQuizFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizDetail | null>(null);

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);

  // Delete confirmations
  const [deleteLessonTarget, setDeleteLessonTarget] = useState<string | null>(null);
  const [deleteQuizTarget, setDeleteQuizTarget] = useState<{ id: string; title: string } | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const data = await getCourse(courseId);
      setCourse(data);
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  function openAddLesson() {
    setLessonFormOpen(true);
  }

  async function handleReorder(lessonId: string, direction: 'up' | 'down') {
    if (!course) return;
    const sorted = [...course.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((l) => l.id === lessonId);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === sorted.length - 1)) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx]!, sorted[idx]!];
    const lessonIds = sorted.map((l) => l.id);

    try {
      await reorderLessons(courseId, lessonIds);
      fetchCourse();
    } catch {
      toast.error('Failed to reorder lessons');
    }
  }

  async function handleEditQuiz(quizId: string) {
    try {
      const detail = await getQuiz(courseId, quizId);
      setEditingQuiz(detail);
      setQuizFormOpen(true);
    } catch {
      toast.error('Failed to load quiz');
    }
  }

  async function handleDeleteLesson() {
    if (!deleteLessonTarget) return;
    try {
      await deleteLesson(courseId, deleteLessonTarget);
      toast.success('Lesson deleted');
      setDeleteLessonTarget(null);
      fetchCourse();
    } catch {
      toast.error('Failed to delete lesson');
    }
  }

  async function handleDeleteQuiz() {
    if (!deleteQuizTarget) return;
    try {
      await deleteQuiz(courseId, deleteQuizTarget.id);
      toast.success('Quiz deleted');
      setDeleteQuizTarget(null);
      fetchCourse();
    } catch {
      toast.error('Failed to delete quiz');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Course not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/admin/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  const sortedLessons = [...course.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortedQuizzes = [...course.quizzes].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push('/dashboard/admin/courses')}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            {course.description && (
              <p className="text-muted-foreground mt-1">{course.description}</p>
            )}
          </div>
        </div>
        <Button onClick={() => setAssignOpen(true)}>
          <Users className="size-4 mr-1" />
          Assign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lessons</CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.lessons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes</CardTitle>
            <ClipboardList className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.quizzes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned To</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.assignmentCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons ({course.lessons.length})</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes ({course.quizzes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddLesson}>
              <Plus className="size-4 mr-1" />
              Add Lesson
            </Button>
          </div>

          {sortedLessons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="size-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No lessons yet. Add your first lesson.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Duration</TableHead>
                    <TableHead className="w-28 text-center">Order</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLessons.map((lesson, idx) => {
                    const Icon = typeIcons[lesson.type] || Type;
                    return (
                      <TableRow key={lesson.id}>
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/admin/courses/${courseId}/lessons/${lesson.id}`}
                            className="font-medium hover:text-primary transition-colors hover:underline"
                          >
                            {lesson.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            <Icon className="size-3 mr-0.5" />
                            {lesson.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {formatDuration(lesson.durationSec)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={idx === 0}
                              onClick={() => handleReorder(lesson.id, 'up')}
                            >
                              <ChevronUp className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={idx === sortedLessons.length - 1}
                              onClick={() => handleReorder(lesson.id, 'down')}
                            >
                              <ChevronDown className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link href={`/dashboard/admin/courses/${courseId}/lessons/${lesson.id}`}>
                              <Button variant="ghost" size="icon-xs">
                                <Eye className="size-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setDeleteLessonTarget(lesson.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingQuiz(null); setQuizFormOpen(true); }}>
              <Plus className="size-4 mr-1" />
              Add Quiz
            </Button>
          </div>

          {sortedQuizzes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="size-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">No quizzes yet. Add your first quiz.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Linked Lesson</TableHead>
                    <TableHead className="text-center">Questions</TableHead>
                    <TableHead className="text-center">Passing Score</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedQuizzes.map((quiz) => {
                    const linkedLesson = quiz.lessonId
                      ? course.lessons.find((l) => l.id === quiz.lessonId)
                      : null;
                    return (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell className="text-sm">
                        {linkedLesson ? (
                          <Link
                            href={`/dashboard/admin/courses/${courseId}/lessons/${linkedLesson.id}`}
                            className="text-primary hover:underline"
                          >
                            {linkedLesson.title}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{quiz.questionCount}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{quiz.passingScore}%</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleEditQuiz(quiz.id)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDeleteQuizTarget({ id: quiz.id, title: quiz.title })}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Lesson Form Dialog */}
      <LessonFormDialog
        courseId={courseId}
        open={lessonFormOpen}
        onOpenChange={setLessonFormOpen}
        onSuccess={fetchCourse}
      />

      {/* Quiz Form Dialog */}
      <QuizFormDialog
        courseId={courseId}
        open={quizFormOpen}
        onOpenChange={(open) => { setQuizFormOpen(open); if (!open) setEditingQuiz(null); }}
        onSuccess={fetchCourse}
        quiz={editingQuiz}
        lessons={course.lessons.map((l) => ({ id: l.id, title: l.title }))}
        linkedLessonIds={course.quizzes.filter((q) => q.lessonId).map((q) => q.lessonId!)}
      />

      {/* Assign Dialog */}
      <AssignCourseDialog
        courseId={courseId}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onSuccess={fetchCourse}
      />

      {/* Delete Lesson Confirmation */}
      <Dialog
        open={!!deleteLessonTarget}
        onOpenChange={(open) => { if (!open) setDeleteLessonTarget(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLessonTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLesson}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Quiz Confirmation */}
      <Dialog
        open={!!deleteQuizTarget}
        onOpenChange={(open) => { if (!open) setDeleteQuizTarget(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteQuizTarget?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteQuizTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuiz}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

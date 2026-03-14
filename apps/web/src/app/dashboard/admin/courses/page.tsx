'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen, Plus, Search, MoreHorizontal,
  Pencil, Trash2, Eye, EyeOff,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FadeIn } from '@/components/animations/fade-in';
import {
  getCourses, createCourse, updateCourse, deleteCourse,
  type Course,
} from '@/lib/api/courses';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await getCourses({ search: search || undefined });
      setCourses(res.data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  function openCreate() {
    setEditingCourse(null);
    setFormTitle('');
    setFormDescription('');
    setDialogOpen(true);
  }

  function openEdit(course: Course) {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormDescription(course.description || '');
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!formTitle.trim()) return;
    setSubmitting(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, {
          title: formTitle,
          description: formDescription || undefined,
        });
        toast.success('Course updated');
      } else {
        await createCourse({
          title: formTitle,
          description: formDescription || undefined,
        });
        toast.success('Course created');
      }
      setDialogOpen(false);
      fetchCourses();
    } catch {
      toast.error(editingCourse ? 'Failed to update course' : 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(course: Course) {
    try {
      await updateCourse(course.id, { isPublished: !course.isPublished });
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published');
      fetchCourses();
    } catch {
      toast.error('Failed to update course');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCourse(deleteTarget.id);
      toast.success('Course deleted');
      setDeleteTarget(null);
      fetchCourses();
    } catch {
      toast.error('Failed to delete course');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-56 mt-2" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn duration={500}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground mt-1">
              Manage your training courses.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4 mr-1" />
            Create Course
          </Button>
        </div>
      </FadeIn>

      {courses.length > 0 && (
        <FadeIn delay={100}>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </FadeIn>
      )}

      <FadeIn delay={150}>
        {courses.length === 0 && !search ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <BookOpen className="size-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium">No courses yet</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Create your first course to get started.
              </p>
              <Button onClick={openCreate}>
                <Plus className="size-4 mr-1" />
                Create Course
              </Button>
            </CardContent>
          </Card>
        ) : courses.length === 0 && search ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-sm">
                No courses match your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover:shadow-md transition-shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Lessons</TableHead>
                  <TableHead className="text-center">Quizzes</TableHead>
                  <TableHead className="text-center">Assigned</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} className="group/row">
                    <TableCell>
                      <Link href={`/dashboard/admin/courses/${course.id}`} className="block group">
                        <span className="font-medium group-hover:text-primary transition-colors">{course.title}</span>
                        {course.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {course.description}
                          </p>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{course.lessonCount}</TableCell>
                    <TableCell className="text-center tabular-nums">{course.quizCount}</TableCell>
                    <TableCell className="text-center tabular-nums">{course.assignmentCount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(course)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePublish(course)}>
                            {course.isPublished ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                            {course.isPublished ? 'Unpublish' : 'Publish'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(course)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </FadeIn>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Create Course'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? 'Update the course details below.'
                : 'Fill in the details to create a new course.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Title</Label>
              <Input
                id="course-title"
                placeholder="e.g. Sales Fundamentals"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-desc">Description</Label>
              <Textarea
                id="course-desc"
                placeholder="Course description..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || submitting}
            >
              {submitting
                ? 'Saving...'
                : editingCourse
                  ? 'Save Changes'
                  : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CheckCircle, Video,
  Headphones, FileText, Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getLesson, getLessons, updateProgress, type Lesson } from '@/lib/api/lessons';
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

  useEffect(() => {
    progressSent.current = false;
    Promise.all([getLesson(courseId, lessonId), getLessons(courseId)])
      .then(([l, all]) => {
        setLesson(l);
        setAllLessons(all.sort((a, b) => a.sortOrder - b.sortOrder));
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

      {/* Mark Complete */}
      <div className="flex justify-center">
        <Button onClick={markComplete} disabled={completing || progressSent.current}>
          <CheckCircle className="size-4 mr-1" />
          {progressSent.current ? 'Completed' : completing ? 'Marking...' : 'Mark as Complete'}
        </Button>
      </div>

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

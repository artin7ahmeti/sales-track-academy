'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Video, Headphones, FileText, Type, Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { FadeIn } from '@/components/animations/fade-in';
import { getLesson, getLessons, type Lesson } from '@/lib/api/lessons';
import { LessonFormDialog } from '@/features/admin/lesson-form-dialog';
import { CommentSection } from '@/features/shared/comment-section';

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1]! : null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1]! : null;
}

function VideoPlayer({ url }: { url: string }) {
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video lesson"
        />
      </div>
    );
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Video lesson"
        />
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <video src={url} controls className="w-full h-full" />
    </div>
  );
}

function AudioPlayer({ url }: { url: string }) {
  return (
    <div className="rounded-lg border p-6 flex items-center justify-center">
      <audio src={url} controls className="w-full max-w-lg" />
    </div>
  );
}

function PdfViewer({ url }: { url: string }) {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ height: '70vh' }}>
      <iframe src={url} className="w-full h-full" title="PDF lesson" />
    </div>
  );
}

function TextViewer({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="pt-6 prose prose-sm max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: text }} />
      </CardContent>
    </Card>
  );
}

export default function AdminLessonViewPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const { courseId, lessonId } = params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  function fetchData() {
    setLoading(true);
    Promise.all([getLesson(courseId, lessonId), getLessons(courseId)])
      .then(([l, all]) => {
        setLesson(l);
        setAllLessons(all.sort((a, b) => a.sortOrder - b.sortOrder));
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
  const content = lesson.content as Record<string, string>;

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
        <div>
          {lesson.type === 'VIDEO' && content.url && <VideoPlayer url={content.url} />}
          {lesson.type === 'AUDIO' && content.url && <AudioPlayer url={content.url} />}
          {lesson.type === 'PDF' && content.url && <PdfViewer url={content.url} />}
          {lesson.type === 'TEXT' && content.text && <TextViewer text={content.text} />}

          {!content.url && !content.text && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-sm">No content uploaded for this lesson.</p>
              </CardContent>
            </Card>
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
    </div>
  );
}

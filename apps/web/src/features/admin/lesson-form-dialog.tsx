'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createLesson, updateLesson, type Lesson } from '@/lib/api/lessons';

interface LessonFormDialogProps {
  courseId: string;
  lesson?: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type LessonType = 'VIDEO' | 'AUDIO' | 'PDF' | 'TEXT';

export function LessonFormDialog({
  courseId, lesson, open, onOpenChange, onSuccess,
}: LessonFormDialogProps) {
  const isEditing = !!lesson;

  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [type, setType] = useState<LessonType>((lesson?.type as LessonType) || 'TEXT');
  const [contentUrl, setContentUrl] = useState(
    (lesson?.content as Record<string, string>)?.url || '',
  );
  const [contentText, setContentText] = useState(
    (lesson?.content as Record<string, string>)?.text || '',
  );
  const [duration, setDuration] = useState(
    lesson?.durationSec ? String(Math.round(lesson.durationSec / 60)) : '',
  );
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    if (!lesson) {
      setTitle('');
      setDescription('');
      setType('TEXT');
      setContentUrl('');
      setContentText('');
      setDuration('');
    }
  }

  function buildContent(): Record<string, unknown> {
    if (type === 'TEXT') return { text: contentText };
    return { url: contentUrl };
  }

  async function handleSubmit() {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      if (isEditing && lesson) {
        await updateLesson(courseId, lesson.id, {
          title,
          description: description || undefined,
          content: buildContent(),
        });
        toast.success('Lesson updated');
      } else {
        await createLesson(courseId, {
          title,
          description: description || undefined,
          type,
          content: buildContent(),
          durationSec: duration ? parseInt(duration) * 60 : undefined,
        });
        toast.success('Lesson created');
      }
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(isEditing ? 'Failed to update lesson' : 'Failed to create lesson');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update lesson details.'
              : 'Add a new lesson to this course.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Title</Label>
            <Input
              id="lesson-title"
              placeholder="e.g. Introduction to Cold Calling"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-desc">Description</Label>
            <Input
              id="lesson-desc"
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {!isEditing && (
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType((v as LessonType) || 'TEXT')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="AUDIO">Audio</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="TEXT">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {type === 'TEXT' ? (
            <div className="space-y-2">
              <Label htmlFor="lesson-text">Content</Label>
              <Textarea
                id="lesson-text"
                placeholder="Write your lesson content here..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={6}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="lesson-url">
                {type === 'VIDEO' ? 'Video URL (YouTube/Vimeo or direct link)' :
                 type === 'AUDIO' ? 'Audio URL' : 'PDF URL'}
              </Label>
              <Input
                id="lesson-url"
                type="url"
                placeholder={
                  type === 'VIDEO' ? 'https://youtube.com/watch?v=...' :
                  type === 'AUDIO' ? 'https://example.com/audio.mp3' :
                  'https://example.com/document.pdf'
                }
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="lesson-duration">Duration (minutes)</Label>
            <Input
              id="lesson-duration"
              type="number"
              min="1"
              placeholder="10"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
          >
            {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Lesson'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

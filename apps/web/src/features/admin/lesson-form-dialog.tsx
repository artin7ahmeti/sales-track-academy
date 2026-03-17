'use client';

import { useState, useRef } from 'react';
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
import { Upload, X, File as FileIcon } from 'lucide-react';
import { createLesson, updateLesson, type Lesson } from '@/lib/api/lessons';
import { getUploadUrl, confirmUpload } from '@/lib/api/storage';

interface LessonFormDialogProps {
  courseId: string;
  lesson?: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type LessonType = 'VIDEO' | 'AUDIO' | 'PDF' | 'TEXT';

const ACCEPTED_TYPES: Record<string, string> = {
  VIDEO: 'video/mp4,video/webm',
  AUDIO: 'audio/mpeg,audio/mp3,audio/wav,audio/ogg',
  PDF: 'application/pdf',
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export function LessonFormDialog({
  courseId, lesson, open, onOpenChange, onSuccess,
}: LessonFormDialogProps) {
  const isEditing = !!lesson;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [type, setType] = useState<LessonType>((lesson?.type as LessonType) || 'TEXT');
  const [contentUrl, setContentUrl] = useState(
    (lesson?.content as Record<string, string>)?.url || '',
  );
  const [contentText, setContentText] = useState(
    ((lesson?.content as Record<string, string>)?.text ||
     (lesson?.content as Record<string, string>)?.body) || '',
  );
  const [duration, setDuration] = useState(
    lesson?.durationSec ? String(Math.round(lesson.durationSec / 60)) : '',
  );
  const [file, setFile] = useState<File | null>(null);
  const [existingS3Key, setExistingS3Key] = useState<string>(
    (lesson?.content as Record<string, string>)?.s3Key || '',
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function resetForm() {
    if (!lesson) {
      setTitle('');
      setDescription('');
      setType('TEXT');
      setContentUrl('');
      setContentText('');
      setDuration('');
      setFile(null);
      setExistingS3Key('');
      setUploadProgress(0);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 100 MB limit');
      return;
    }

    setFile(selected);
    setContentUrl('');
  }

  function removeFile() {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadFileToS3(fileToUpload: File): Promise<string> {
    const { uploadUrl, key } = await getUploadUrl({
      fileName: fileToUpload.name,
      contentType: fileToUpload.type,
      entityType: 'lesson-content',
      entityId: courseId,
    });

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed with status ${xhr.status}`));
      });
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', fileToUpload.type);
      xhr.send(fileToUpload);
    });

    await confirmUpload(key);
    return key;
  }

  function buildContent(s3Key?: string): Record<string, unknown> {
    if (type === 'TEXT') return { text: contentText };

    if (s3Key) {
      if (type === 'VIDEO') return { url: '', s3Key, source: 's3' };
      return { url: '', s3Key };
    }

    if (type === 'VIDEO') {
      return { url: contentUrl };
    }

    return { url: contentUrl };
  }

  async function handleSubmit() {
    if (!title.trim()) return;

    const needsFile = (type === 'AUDIO' || type === 'PDF') && !file && !existingS3Key && !contentUrl;
    if (needsFile) {
      toast.error(`Please select a ${type === 'AUDIO' ? 'audio' : 'PDF'} file to upload`);
      return;
    }

    setSubmitting(true);
    try {
      let s3Key = existingS3Key || undefined;
      const durationSec = duration.trim() ? parseInt(duration, 10) * 60 : null;

      if (file) {
        s3Key = await uploadFileToS3(file);
      }

      const content = buildContent(s3Key);

      if (isEditing && lesson) {
        await updateLesson(courseId, lesson.id, {
          title,
          description: description || undefined,
          content,
          durationSec,
        });
        toast.success('Lesson updated');
      } else {
        await createLesson(courseId, {
          title,
          description: description || undefined,
          type,
          content,
          durationSec: durationSec ?? undefined,
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
      setUploadProgress(0);
    }
  }

  const showFileUpload = type === 'AUDIO' || type === 'PDF' || type === 'VIDEO';
  const showUrlInput = type === 'VIDEO';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md [&>*]:min-w-0">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update lesson details.'
              : 'Add a new lesson to this course.'}
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 space-y-4">
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
              <Select value={type} onValueChange={(v) => { setType((v as LessonType) || 'TEXT'); setFile(null); setContentUrl(''); }}>
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

          {/* TEXT content */}
          {type === 'TEXT' && (
            <div className="space-y-2">
              <Label htmlFor="lesson-text">Content</Label>
              <Textarea
                id="lesson-text"
                placeholder="Write your lesson content here..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={10}
                className="h-30 min-h-30 resize-none overflow-y-auto [field-sizing:fixed]"
              />
            </div>
          )}

          {/* VIDEO URL input */}
          {showUrlInput && (
            <div className="space-y-2">
              <Label htmlFor="lesson-url">Video URL (YouTube/Vimeo)</Label>
              <Input
                id="lesson-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={contentUrl}
                onChange={(e) => { setContentUrl(e.target.value); if (e.target.value) { setFile(null); setExistingS3Key(''); } }}
                disabled={!!file}
              />
            </div>
          )}

          {/* Divider for VIDEO */}
          {type === 'VIDEO' && (
            <div className="flex items-center gap-3">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground">or upload a file</span>
              <div className="h-px bg-border flex-1" />
            </div>
          )}

          {/* File upload section */}
          {showFileUpload && (
            <div className="space-y-2">
              {type !== 'VIDEO' && (
                <Label>
                  {type === 'AUDIO' ? 'Audio File' : 'PDF File'}
                </Label>
              )}

              {/* Show existing S3 file */}
              {existingS3Key && !file && (
                <div className="flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-md border bg-muted/50 px-3 py-2 text-sm">
                  <FileIcon className="size-4 text-muted-foreground shrink-0" />
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    Current file uploaded
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setExistingS3Key('')}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}

              {/* Show selected file */}
              {file && (
                <div className="space-y-2">
                  <div className="flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-md border bg-muted/50 px-3 py-2 text-sm">
                    <FileIcon className="size-4 text-muted-foreground shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={removeFile}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  {submitting && uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* File input button */}
              {!file && !existingS3Key && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES[type]}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={type === 'VIDEO' && !!contentUrl}
                  >
                    <Upload className="size-4 mr-2" />
                    {type === 'VIDEO' ? 'Upload Video (.mp4, .webm)' :
                     type === 'AUDIO' ? 'Upload Audio (.mp3, .wav, .ogg)' :
                     'Upload PDF (.pdf)'}
                  </Button>
                </div>
              )}
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
            {submitting && uploadProgress > 0 && uploadProgress < 100
              ? `Uploading ${uploadProgress}%...`
              : submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Lesson'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDownloadUrl } from '@/lib/api/storage';

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
    <div className="rounded-lg border bg-muted/30 p-8 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Sales Call Recording
      </div>
      <audio src={url} controls className="w-full max-w-lg" preload="metadata" />
    </div>
  );
}

function PdfViewer({ url }: { url: string }) {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ height: '70vh' }}>
      <iframe
        src={`${url}#toolbar=0&navpanes=0`}
        className="w-full h-full"
        title="PDF lesson"
      />
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

interface LessonContentViewerProps {
  type: string;
  content: Record<string, unknown>;
}

export function LessonContentViewer({ type, content }: LessonContentViewerProps) {
  const [signedUrlState, setSignedUrlState] = useState<{
    requestKey: string | null;
    url: string | null;
  }>({
    requestKey: null,
    url: null,
  });

  const s3Key = content.s3Key as string | undefined;
  const rawUrl = content.url as string | undefined;
  const text = (content.text || content.body) as string | undefined;
  const inline = type === 'PDF';
  const requestKey = s3Key ? `${type}:${s3Key}` : null;

  useEffect(() => {
    if (!s3Key || !requestKey) return;

    let cancelled = false;
    getDownloadUrl(s3Key, inline)
      .then(({ url }) => {
        if (!cancelled) {
          setSignedUrlState({ requestKey, url });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSignedUrlState({ requestKey, url: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inline, requestKey, s3Key]);

  const resolving = Boolean(requestKey) && signedUrlState.requestKey !== requestKey;

  if (resolving) {
    return <Skeleton className="h-96 w-full rounded-lg" />;
  }

  const url = requestKey ? signedUrlState.url : rawUrl;

  if (type === 'TEXT' && text) return <TextViewer text={text} />;
  if (type === 'VIDEO' && url) return <VideoPlayer url={url} />;
  if (type === 'AUDIO' && url) return <AudioPlayer url={url} />;
  if (type === 'PDF' && url) return <PdfViewer url={url} />;

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">No content uploaded for this lesson.</p>
      </CardContent>
    </Card>
  );
}

import { useEffect, useState } from 'react';
import { getDownloadUrl } from '@/lib/api/storage';

const cache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_TTL = 50 * 60 * 1000; // 50 minutes (presigned URLs last 60min)

export function useThumbnailUrl(thumbnailKey: string | null | undefined) {
  const [resolvedUrl, setResolvedUrl] = useState<{ key: string; url: string } | null>(null);

  const immediateUrl = (() => {
    if (!thumbnailKey) {
      return null;
    }

    if (thumbnailKey.startsWith('http')) {
      return thumbnailKey;
    }

    return cache.get(thumbnailKey)?.url ?? null;
  })();

  useEffect(() => {
    if (!thumbnailKey || thumbnailKey.startsWith('http')) {
      return;
    }

    const cached = cache.get(thumbnailKey);
    if (cached && cached.expiresAt > Date.now()) {
      return;
    }

    let cancelled = false;
    getDownloadUrl(thumbnailKey, true)
      .then((res) => {
        if (cancelled) return;
        cache.set(thumbnailKey, { url: res.url, expiresAt: Date.now() + CACHE_TTL });
        setResolvedUrl({ key: thumbnailKey, url: res.url });
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [thumbnailKey]);

  return immediateUrl ?? (resolvedUrl && resolvedUrl.key === thumbnailKey ? resolvedUrl.url : null);
}

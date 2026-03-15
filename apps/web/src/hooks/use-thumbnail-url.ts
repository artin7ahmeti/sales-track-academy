import { useEffect, useState } from 'react';
import { getDownloadUrl } from '@/lib/api/storage';

const cache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_TTL = 50 * 60 * 1000; // 50 minutes (presigned URLs last 60min)

export function useThumbnailUrl(thumbnailKey: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!thumbnailKey) {
      setUrl(null);
      return;
    }

    // If it's already a full URL (legacy), use it directly
    if (thumbnailKey.startsWith('http')) {
      setUrl(thumbnailKey);
      return;
    }

    // Check cache
    const cached = cache.get(thumbnailKey);
    if (cached && cached.expiresAt > Date.now()) {
      setUrl(cached.url);
      return;
    }

    let cancelled = false;
    getDownloadUrl(thumbnailKey, true)
      .then((res) => {
        if (cancelled) return;
        cache.set(thumbnailKey, { url: res.url, expiresAt: Date.now() + CACHE_TTL });
        setUrl(res.url);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => { cancelled = true; };
  }, [thumbnailKey]);

  return url;
}

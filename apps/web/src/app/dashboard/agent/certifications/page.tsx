'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Award, Download, BookOpen, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FadeIn, StaggerChildren } from '@/components/animations/fade-in';
import {
  getMyCertificates,
  downloadCertificate,
  type Certificate,
} from '@/lib/api/certificates';
import { useThumbnailUrl } from '@/hooks/use-thumbnail-url';

function CourseThumbnail({ thumbnailKey }: { thumbnailKey: string | null }) {
  const url = useThumbnailUrl(thumbnailKey);
  if (!url) {
    return (
      <div className="flex items-center justify-center size-14 rounded-lg bg-muted shrink-0">
        <BookOpen className="size-5 text-muted-foreground/30" />
      </div>
    );
  }
  return (
    <Image
      src={url}
      alt=""
      width={56}
      height={56}
      className="size-14 rounded-lg object-cover shrink-0"
      unoptimized
    />
  );
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadCertificate(certificate.id);
    } catch {
      // silently fail
    } finally {
      setDownloading(false);
    }
  };

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="group hover:shadow-md hover:border-primary/20 transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <CourseThumbnail thumbnailKey={certificate.courseThumbnailUrl} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {certificate.courseTitle}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{issuedDate}</span>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                {certificate.certificateNumber}
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-1.5">
                <Award className="size-3.5 text-amber-500" />
                <span className="text-xs font-medium text-muted-foreground">
                  Certificate of Achievement
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
                className="h-7 text-xs gap-1.5"
              >
                <Download className="size-3" />
                {downloading ? 'Loading...' : 'Download'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CertificationsPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCertificates()
      .then(setCertificates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Skeleton className="size-14 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28 mt-2" />
                    <Skeleton className="h-7 w-24 mt-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn duration={500}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Certifications</h1>
          <p className="text-muted-foreground mt-1">
            Certificates earned by completing courses.
          </p>
        </div>
      </FadeIn>

      {certificates.length === 0 ? (
        <FadeIn delay={100}>
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Award className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-muted-foreground">
                  No certificates yet
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Complete all lessons and pass all quizzes in a course to earn your certificate.
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <StaggerChildren
          staggerDelay={80}
          className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2"
        >
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}

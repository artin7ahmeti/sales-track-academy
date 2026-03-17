import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { AcceptInviteForm } from '@/features/auth/accept-invite-form';

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div
        className="text-center py-8"
        style={{ animation: 'page-fade-in 0.6s ease-out both' }}
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Invalid invitation link</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
          Please check your email and make sure you opened the full invitation URL.
        </p>
        <Link
          href="/public/login"
          className="mt-6 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return <AcceptInviteForm token={token} />;
}

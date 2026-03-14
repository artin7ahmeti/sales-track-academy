import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
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
        className="mx-auto w-full max-w-md rounded-2xl p-8 text-center glass-card-strong md:p-10"
        style={{ animation: 'page-fade-in 0.7s ease-out both 0.3s' }}
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <GraduationCap className="size-6 text-white" />
        </div>
        <p className="text-2xl font-bold tracking-tight text-white">Invalid invitation link</p>
        <p className="mt-2 text-sm text-white/50">
          Please check your email and make sure you opened the full invitation URL.
        </p>
        <Link
          href="/public/login"
          className="mt-6 inline-flex text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return <AcceptInviteForm token={token} />;
}

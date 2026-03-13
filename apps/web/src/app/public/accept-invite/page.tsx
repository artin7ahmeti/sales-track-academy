import { AcceptInviteForm } from '@/features/auth/accept-invite-form';
import { Card, CardContent } from '@/components/ui/card';

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive font-medium">Invalid invitation link</p>
          <p className="text-muted-foreground mt-2">
            Please check your email for the correct invitation link.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <AcceptInviteForm token={token} />;
}

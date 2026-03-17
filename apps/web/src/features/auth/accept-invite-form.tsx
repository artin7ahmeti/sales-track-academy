'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { acceptInvite } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowRight, CheckCircle } from 'lucide-react';

const acceptInviteSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: AcceptInviteFormValues) {
    setError(null);
    try {
      const result = await acceptInvite(token, values.name, values.password);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/public/login?email=${encodeURIComponent(result.email)}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation.');
    }
  }

  if (success) {
    return (
      <div
        className="text-center py-8"
        style={{ animation: 'page-fade-in 0.6s ease-out both' }}
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="size-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Account activated</h2>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'page-fade-in 0.6s ease-out both 0.15s' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Accept your invitation</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Set up your account to join SalesTrack Academy
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" className="h-10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Min. 8 chars"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Re-enter"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="w-full h-10"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              'Activating...'
            ) : (
              <>
                Activate Account
                <ArrowRight className="ml-1.5 size-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already activated?{' '}
          <Link
            href="/public/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

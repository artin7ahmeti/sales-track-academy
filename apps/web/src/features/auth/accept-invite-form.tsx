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
import { ArrowRight, GraduationCap } from 'lucide-react';

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

  const inputClasses =
    'h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/25 focus:ring-white/10';

  if (success) {
    return (
      <div
        className="mx-auto w-full max-w-md rounded-2xl p-8 text-center glass-card-strong md:p-10"
        style={{ animation: 'page-fade-in 0.7s ease-out both 0.3s' }}
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <GraduationCap className="size-6 text-white" />
        </div>
        <p className="text-2xl font-bold tracking-tight text-white">Account activated</p>
        <p className="mt-2 text-sm text-white/50">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-md rounded-2xl p-8 glass-card-strong md:p-10"
      style={{ animation: 'page-fade-in 0.7s ease-out both 0.3s' }}
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <GraduationCap className="size-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Accept your invitation</h1>
        <p className="mt-1.5 text-sm text-white/50">Set up your account to join SalesTrack Academy</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wider text-white/70">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" className={inputClasses} {...field} />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-white/70">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="password"
                      className={inputClasses}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-white/70">
                    Confirm
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="password"
                      className={inputClasses}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="mt-1 h-11 w-full bg-white font-medium text-black transition-all duration-200 hover:bg-white/90"
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
        <p className="text-sm text-white/40">
          Already activated?{' '}
          <Link
            href="/public/login"
            className="font-medium text-white/80 transition-colors hover:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

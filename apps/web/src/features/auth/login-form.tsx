'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from './auth-provider';
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
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Role } from '@salestrack/contracts';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    try {
      const user = await login(values.email, values.password);
      if (user.role === Role.ADMIN) {
        router.push('/dashboard/admin/analytics');
      } else {
        router.push('/dashboard/agent');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  }

  return (
    <div
      className="mx-auto w-full max-w-md glass-card-strong rounded-2xl p-8 md:p-10"
      style={{ animation: 'page-fade-in 0.7s ease-out both 0.3s' }}
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <GraduationCap className="size-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-white/50">Sign in to SalesTrack Academy</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70 text-xs font-medium uppercase tracking-wider">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your@company.com"
                    className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/25 focus:ring-white/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70 text-xs font-medium uppercase tracking-wider">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/25 focus:ring-white/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full h-11 bg-white text-black font-medium hover:bg-white/90 transition-all duration-200"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              'Signing in...'
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-1.5 size-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-white/40">
          Don&apos;t have an account?{' '}
          <Link
            href={defaultEmail ? `/public/signup?email=${encodeURIComponent(defaultEmail)}` : '/public/signup'}
            className="text-white/80 font-medium hover:text-white transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

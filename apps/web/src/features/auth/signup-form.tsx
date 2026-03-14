'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signup as signupApi } from '@/lib/api/auth';
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

const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm({ defaultEmail }: { defaultEmail?: string }) {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: defaultEmail || '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: SignupFormValues) {
    setError(null);
    try {
      await signupApi(values.name, values.email, values.password);
      await login(values.email, values.password);
      router.push('/dashboard/agent');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Signup failed. Please try again.',
      );
    }
  }

  const inputClasses =
    'h-11 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-white/25 focus:ring-white/10';

  return (
    <div
      className="mx-auto w-full max-w-md glass-card-strong rounded-2xl p-8 md:p-10"
      style={{ animation: 'page-fade-in 0.7s ease-out both 0.3s' }}
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <GraduationCap className="size-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-white/50">Get started with SalesTrack Academy</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70 text-xs font-medium uppercase tracking-wider">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" className={inputClasses} {...field} />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
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
                    className={inputClasses}
                    {...field}
                  />
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
                  <FormLabel className="text-white/70 text-xs font-medium uppercase tracking-wider">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
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
                  <FormLabel className="text-white/70 text-xs font-medium uppercase tracking-wider">
                    Confirm
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
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
            className="w-full h-11 bg-white text-black font-medium hover:bg-white/90 transition-all duration-200 mt-1"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              'Creating account...'
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-1.5 size-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-white/40">
          Already have an account?{' '}
          <Link
            href="/public/login"
            className="text-white/80 font-medium hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

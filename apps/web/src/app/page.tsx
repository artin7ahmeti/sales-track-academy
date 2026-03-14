'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LightRaysBackground } from '@/components/backgrounds/light-rays-background';
import { FadeIn, StaggerChildren } from '@/components/animations/fade-in';
import {
  GraduationCap, BookOpen, Brain, BarChart3,
  Users, ArrowRight, Menu, X, CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Course Builder',
    description: 'Create multimedia courses with video, audio, PDF, and text lessons. Drag-and-drop ordering.',
  },
  {
    icon: Brain,
    title: 'Quiz Engine',
    description: 'Build MCQ assessments with configurable passing scores to validate learning outcomes.',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Real-time dashboards showing completion rates, quiz scores, and engagement metrics.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Organize agents into groups, assign courses in bulk, and track individual performance.',
  },
];

const highlights = [
  'Video, audio, PDF & text lessons',
  'Built-in quiz assessments',
  'Real-time progress tracking',
  'Group-based course assignment',
];

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleGetStarted(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/public/signup?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/public/signup');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Navigation */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ease-out ${
          scrolled
            ? 'top-4 left-1/2 -translate-x-1/2 max-w-3xl px-2'
            : 'top-0 left-0 translate-x-0 max-w-none px-0'
        }`}
      >
        <nav
          className={`transition-all duration-500 ease-out ${
            scrolled
              ? 'mx-auto rounded-full nav-floating px-6 py-2.5'
              : 'border-b border-dashed bg-background/80 backdrop-blur-sm px-6 py-0'
          }`}
        >
          <div className={`flex items-center justify-between ${scrolled ? '' : 'mx-auto max-w-6xl h-14'}`}>
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className={`text-primary transition-all duration-300 ${scrolled ? 'size-5' : 'size-6'}`} />
              <span className={`font-bold tracking-tight transition-all duration-300 ${scrolled ? 'text-sm' : 'text-lg'}`}>
                SalesTrack Academy
              </span>
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative z-20 p-2 lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <div className="hidden items-center gap-2 lg:flex">
              <Link href="#features">
                <Button variant="ghost" size="sm" className={`transition-all duration-300 ${scrolled ? 'h-8 text-xs' : ''}`}>
                  Features
                </Button>
              </Link>
              <Link href="/public/login">
                <Button variant="ghost" size="sm" className={`transition-all duration-300 ${scrolled ? 'h-8 text-xs' : ''}`}>
                  Login
                </Button>
              </Link>
              <Link href="/public/signup">
                <Button size="sm" className={`transition-all duration-300 ${scrolled ? 'h-8 text-xs rounded-full px-4' : ''}`}>
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && !scrolled && (
            <div className="border-t pb-4 pt-2 lg:hidden">
              <div className="flex flex-col gap-2 mx-auto max-w-6xl">
                <Link href="#features" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Features</Button>
                </Link>
                <Link href="/public/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/public/signup" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-14">
          <LightRaysBackground />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 lg:py-32">
            <div className="lg:flex lg:items-center lg:gap-16">
              <div className="mx-auto max-w-xl text-center lg:mx-0 lg:w-1/2 lg:text-left">
                <FadeIn delay={100} duration={700}>
                  <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border px-3 py-1 lg:mx-0">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">New</span>
                    <span className="text-sm text-muted-foreground">Self-service agent onboarding</span>
                  </div>
                </FadeIn>

                <FadeIn delay={200} duration={700}>
                  <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                    Empower Your Sales Team with Structured Training
                  </h1>
                </FadeIn>

                <FadeIn delay={350} duration={700}>
                  <p className="mt-6 text-lg text-muted-foreground">
                    Centralize training materials and track your sales agents&apos; proficiency
                    in real time. Build courses, assess knowledge, and accelerate ramp-up.
                  </p>
                </FadeIn>

                <FadeIn delay={500} duration={700}>
                  <form onSubmit={handleGetStarted} className="mt-8">
                    <div className="mx-auto flex max-w-sm items-center gap-2 lg:mx-0">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10"
                      />
                      <Button type="submit" className="shrink-0">
                        Get Started
                        <ArrowRight className="ml-1 size-4" />
                      </Button>
                    </div>
                  </form>
                </FadeIn>

                <FadeIn delay={650} duration={700}>
                  <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
                    {highlights.map((item) => (
                      <li key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CheckCircle className="size-3.5 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </FadeIn>
              </div>

              {/* Hero visual */}
              <FadeIn delay={400} duration={800} direction="left" distance={30} className="relative mt-16 lg:mt-0 lg:w-1/2">
                <div className="relative rounded-2xl border bg-muted/30 p-6 shadow-lg backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <BarChart3 className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Organization Analytics</p>
                        <p className="text-xs text-muted-foreground">Real-time training metrics</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Completion', value: '87%' },
                        { label: 'Avg Score', value: '92%' },
                        { label: 'Active', value: '24' },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-lg bg-background p-3 text-center shadow-sm">
                          <p className="text-lg font-bold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {['Cold Calling Techniques', 'Objection Handling', 'Closing Strategies'].map((course, i) => (
                        <div key={course} className="flex items-center justify-between rounded-lg bg-background p-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <BookOpen className="size-4 text-muted-foreground" />
                            <span className="text-sm">{course}</span>
                          </div>
                          <div className="h-1.5 w-16 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-1000"
                              style={{ width: `${[95, 72, 45][i]}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/20 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight">
                  Everything you need to train your sales team
                </h2>
                <p className="mt-4 text-muted-foreground">
                  From content creation to performance analytics, SalesTrack Academy
                  gives training managers full visibility and control.
                </p>
              </div>
            </FadeIn>

            <StaggerChildren
              staggerDelay={120}
              baseDelay={100}
              className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map((feature) => (
                <Card key={feature.title} className="border-dashed group hover:border-primary/30 hover:shadow-md transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="mb-4 rounded-lg bg-primary/10 p-2.5 w-fit group-hover:bg-primary/15 transition-colors">
                      <feature.icon className="size-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to level up your team?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Join SalesTrack Academy and start building better sales agents today.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Link href="/public/signup">
                  <Button size="lg">
                    Create Free Account
                    <ArrowRight className="ml-1 size-4" />
                  </Button>
                </Link>
                <Link href="/public/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">SalesTrack Academy</span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SalesTrack Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

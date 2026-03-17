'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { GraduationCap } from 'lucide-react';

const CardSwap = dynamic(
  () => import('@/components/card-swap/card-swap'),
  { ssr: false },
);

// ── Replace these with your own images ──────────────────
const CARD_IMAGES = [
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=480&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=480&fit=crop',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=480&fit=crop',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=480&fit=crop',
];

function CardSwapPanel() {
  return (
    <div className="relative hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow spots */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            SalesTrack Academy
          </h2>
          <p className="mt-2 text-sm text-white/50 max-w-xs">
            Empower your team with structured training, quizzes, and certifications.
          </p>
        </div>

        <div className="relative" style={{ width: 740, height: 320 }}>
          <CardSwap
            width={500}
            height={320}
            cardDistance={30}
            verticalDistance={40}
            delay={4000}
            pauseOnHover={false}
            skewAmount={4}
            easing="elastic"
          >
            {CARD_IMAGES.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt=""
                fill
                sizes="500px"
                className="rounded-xl object-cover"
                draggable={false}
              />
            ))}
          </CardSwap>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[11px] text-white/25 tracking-wide">
          Internal Training Platform
        </p>
      </div>
    </div>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side — auth form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div
            className="mb-8 flex items-center gap-2.5"
            style={{ animation: 'page-fade-in 0.5s ease-out both' }}
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="size-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SalesTrack</span>
          </div>

          {children}
        </div>
      </div>

      {/* Right side — CardSwap visual */}
      <CardSwapPanel />
    </div>
  );
}

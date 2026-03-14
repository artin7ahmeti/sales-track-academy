'use client';

import { SmokeBackground } from '@/components/backgrounds/smoke-background';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <SmokeBackground smokeColor="#1a1a3e" />
      <div className="grain-overlay" />
      <div className="relative z-10 w-full px-4 py-8">
        {children}
      </div>
    </div>
  );
}

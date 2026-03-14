'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const LightRays = dynamic(() => import('./light-rays'), {
  ssr: false,
});

type LightRaysBackgroundProps = {
  className?: string;
};

export function LightRaysBackground({
  className,
}: LightRaysBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
    >
      <LightRays
        className="h-full w-full"
        raysOrigin="top-right"
        raysColor="#ff0505"
        raysSpeed={0.3}
        lightSpread={0.7}
        rayLength={3.2}
        fadeDistance={3.3}
        saturation={1.2}
        noiseAmount={0.05}
        distortion={0.1}
        followMouse
        mouseInfluence={0.1}
      />

      {/* optional readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/60" />
    </div>
  );
}
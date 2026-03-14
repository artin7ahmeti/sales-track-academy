'use client';

import LightRays from './light-rays';

export function HeroLightRays() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -right-72 top-1/2 h-[1080px] w-[1080px] -translate-y-1/2">
        <div style={{ width: '1080px', height: '1080px', position: 'relative' }}>
          <LightRays
            raysOrigin="bottom-right"
            raysColor="#1e00ff"
            raysSpeed={0.8}
            lightSpread={0.8}
            rayLength={3.2}
            pulsating={false}
            fadeDistance={1.3}
            saturation={1.2}
            followMouse
            mouseInfluence={0.1}
            noiseAmount={0.05}
            distortion={0.2}
          />
        </div>
      </div>
    </div>
  );
}

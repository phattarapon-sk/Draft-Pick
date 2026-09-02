'use client';

import React from 'react';
import { BackgroundType, Theme } from '@/types';

interface BackgroundProps {
  type: BackgroundType;
  url?: string;
  theme?: Theme;
  showScanlines?: boolean;
}

export const Background: React.FC<BackgroundProps> = ({
  type,
  url,
  theme,
  showScanlines = true,
}) => {
  if (type === 'transparent') {
    return null; // Transparent for OBS browser overlay
  }

  if (type === 'green_screen') {
    return <div className="absolute inset-0 bg-[#00FF00] pointer-events-none z-0" />;
  }

  const primaryColor = theme?.primary_color || '#00D9FF';
  const secondaryColor = theme?.secondary_color || '#FF3864';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Video Background */}
      {type === 'video' && url ? (
        <video
          src={url}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover filter brightness-75 contrast-125"
        />
      ) : type === 'image' && url ? (
        /* Image Background */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url}
          alt="Overlay Background"
          className="w-full h-full object-cover filter brightness-75 contrast-125"
        />
      ) : (
        /* Dynamic Esports Gradient Atmosphere */
        <div className="w-full h-full bg-[#050816] relative">
          {/* Blue team atmospheric radial glow */}
          <div
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[80%] rounded-full opacity-20 blur-[130px]"
            style={{ backgroundColor: primaryColor }}
          />

          {/* Red team atmospheric radial glow */}
          <div
            className="absolute -top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full opacity-20 blur-[130px]"
            style={{ backgroundColor: secondaryColor }}
          />

          {/* Center dark core */}
          <div className="absolute inset-0 bg-radial from-transparent via-[#050816]/70 to-[#050816]" />

          {/* Geometric subtle grid lines */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
            }}
          />
        </div>
      )}

      {/* Esports Scanlines Effect Overlay */}
      {showScanlines && <div className="absolute inset-0 scanlines opacity-40" />}

      {/* Darkening gradient over background for perfect text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/90 via-transparent to-[#050816]/60" />
    </div>
  );
};

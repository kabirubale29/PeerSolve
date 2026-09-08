import React from 'react';

/**
 * SolarOrbits — High fidelity animated solar system orbital background
 * Matching Image 4 and Image 2 with concentric orbital paths,
 * radiant sun core, and spinning planetary celestial spheres.
 */
export default function SolarOrbits({ className = '', compact = false }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}>
      {/* Radiant Sun Atmospheric Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full animate-pulse-glow bg-[radial-gradient(circle,rgba(251,191,36,0.22)_0%,rgba(245,158,11,0.08)_40%,transparent_75%)]"
      />

      {/* Main Solar System Cluster */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        {/* Orbit Ring 1 (Inner - 260px) */}
        <div className={`${compact ? 'w-48 h-48' : 'w-64 h-64'} rounded-full border border-amber-900/10 absolute animate-orbit-fast flex items-center justify-center`}>
          {/* Planet: Golden Amber Sun Orb */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.85)] ring-2 ring-amber-200/50" />
          </div>
        </div>

        {/* Orbit Ring 2 (Mid-Inner - 440px) */}
        <div className={`${compact ? 'w-72 h-72' : 'w-[440px] h-[440px]'} rounded-full border border-dashed border-amber-900/15 absolute animate-orbit-mid flex items-center justify-center`}>
          {/* Planet: Lavender Moon */}
          <div className="absolute top-1/4 -left-2 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 shadow-[0_0_12px_rgba(168,85,247,0.7)] ring-2 ring-purple-200/50" />
          </div>
          {/* Planet: Soft Ochre Spark */}
          <div className="absolute bottom-1/4 -right-1.5 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          </div>
        </div>

        {/* Orbit Ring 3 (Mid-Outer - 640px) */}
        <div className={`${compact ? 'w-96 h-96' : 'w-[640px] h-[640px]'} rounded-full border border-amber-900/10 absolute animate-orbit-slow flex items-center justify-center`}>
          {/* Planet: Bright Golden Sphere */}
          <div className="absolute -top-3 left-1/3 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 shadow-[0_0_16px_rgba(245,158,11,0.9)] ring-2 ring-amber-100" />
          </div>
          {/* Planet: Sapphire Blue Satellite */}
          <div className="absolute -bottom-2 right-1/3 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-blue-500 to-sky-400 shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
          </div>
        </div>

        {/* Orbit Ring 4 (Outer - 860px) */}
        {!compact && (
          <div className="w-[860px] h-[860px] rounded-full border border-amber-900/5 absolute animate-orbit-reverse-fast flex items-center justify-center">
            <div className="absolute top-1/2 -right-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 shadow-[0_0_10px_rgba(217,119,6,0.6)]" />
            </div>
            <div className="absolute bottom-12 left-1/4 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
            </div>
          </div>
        )}
      </div>

      {/* Secondary Satellite System (Top-Right Node as in Image 4) */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-dashed border-amber-900/10 animate-orbit-slow hidden lg:block">
        <div className="absolute top-10 left-10 w-3 h-3 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
      </div>

      {/* Secondary Satellite System (Bottom-Left Node as in Image 4) */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-amber-900/10 animate-orbit-mid hidden lg:block">
        <div className="absolute top-12 right-12 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
      </div>
    </div>
  );
}

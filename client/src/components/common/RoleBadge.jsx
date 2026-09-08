import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function RoleBadge({ role = 'junior', size = 'sm' }) {
  const isSenior = role?.toLowerCase() === 'senior';

  const sizeClasses = size === 'lg'
    ? 'px-3 py-1 text-sm gap-1.5'
    : 'px-2 py-0.5 text-xs gap-1';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border transition-colors ${sizeClasses} ${
        isSenior
          ? 'bg-purple-50 text-purple-700 border-purple-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}
    >
      {isSenior ? (
        <>
          <GraduationCap className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          Senior Mentor
        </>
      ) : (
        <>
          <Sparkles className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          Junior Peer
        </>
      )}
    </span>
  );
}

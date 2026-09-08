import React from 'react';
import { GraduationCap, Sparkles, BookOpen, ShieldCheck, Zap } from 'lucide-react';

export default function RoleBadge({ role = 'junior', year = null, size = 'sm', showDetailed = false }) {
  const isSenior = role?.toLowerCase() === 'senior';
  const numYear = year ? Number(year) : (isSenior ? 3 : 1);

  const sizeClasses = size === 'lg'
    ? 'px-3 py-1 text-sm gap-1.5'
    : 'px-2 py-0.5 text-xs gap-1';

  // Granular Academic Seniority logic
  if (numYear === 1) {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full border transition-colors ${sizeClasses} bg-emerald-50 text-emerald-700 border-emerald-200`}
        title="1st Year Student (Junior Peer)"
      >
        <Sparkles className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        <span>{showDetailed ? '1st Year • Junior Peer' : '1st Yr Junior'}</span>
      </span>
    );
  }

  if (numYear === 2) {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full border transition-colors ${sizeClasses} bg-sky-50 text-sky-700 border-sky-200`}
        title="2nd Year Student (Peer Guide - Senior to 1st Year)"
      >
        <Zap className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        <span>{showDetailed ? '2nd Year • Peer Guide' : '2nd Yr Guide'}</span>
      </span>
    );
  }

  if (numYear === 3) {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full border transition-colors ${sizeClasses} bg-purple-50 text-purple-700 border-purple-200`}
        title="3rd Year Student (Senior Scholar)"
      >
        <GraduationCap className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        <span>{showDetailed ? '3rd Year • Senior Scholar' : '3rd Yr Senior'}</span>
      </span>
    );
  }

  if (numYear >= 4) {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full border transition-colors ${sizeClasses} bg-amber-50 text-amber-800 border-amber-200`}
        title="4th+ Year Student (Senior Mentor)"
      >
        <ShieldCheck className={size === 'lg' ? 'w-4 h-4 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
        <span>{showDetailed ? 'Final Year • Senior Mentor' : 'Senior Mentor'}</span>
      </span>
    );
  }

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

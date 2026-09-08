import React from 'react';
import BrandLogo from '../common/BrandLogo';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-amber-900/10 bg-[#FAF7F2] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" showTagline={false} linkTo="/" />
          <span className="text-xs text-slate-400">© {new Date().getFullYear()} Academic Doubt Network</span>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1 font-serif italic">
          Turning private chat doubts into reusable academic knowledge.
        </p>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span>Semantic Search</span>
          <span>•</span>
          <span>Advisory AI Verification</span>
          <span>•</span>
          <span>Anonymous Asking</span>
        </div>
      </div>
    </footer>
  );
}

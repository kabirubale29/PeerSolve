import React from 'react';
import { Layers, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-slate-800">PeerSolve</span>
          <span className="text-xs text-slate-400">© {new Date().getFullYear()} Academic Doubt Forum</span>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1">
          Turning private chat doubts into reusable academic knowledge
        </p>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span>Search before asking</span>
          <span>•</span>
          <span>Advisory AI Verification</span>
          <span>•</span>
          <span>Anonymous Asking</span>
        </div>
      </div>
    </footer>
  );
}

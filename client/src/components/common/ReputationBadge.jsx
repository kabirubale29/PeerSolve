import React from 'react';
import { Star } from 'lucide-react';

export default function ReputationBadge({ reputation = 0, size = 'sm' }) {
  const isLarge = size === 'lg';

  return (
    <span
      className={`inline-flex items-center font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full ${
        isLarge ? 'px-3 py-1 text-sm gap-1.5' : 'px-2 py-0.5 text-xs gap-1'
      }`}
      title="Community Reputation Score"
    >
      <Star className={`${isLarge ? 'w-4 h-4' : 'w-3 h-3'} fill-amber-400 text-amber-500`} />
      <span>{reputation.toLocaleString()} Rep</span>
    </span>
  );
}

import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export default function AnswerSortSelector({ currentSort = 'recommended', onSortChange, totalAnswers = 0 }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-200">
      <h3 className="font-bold text-base text-slate-900">
        {totalAnswers} {totalAnswers === 1 ? 'Answer' : 'Answers'}
      </h3>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-500 font-medium">Sort by:</span>
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="recommended">Recommended (Accepted & AI Reviewed)</option>
          <option value="upvoted">Most Upvoted</option>
          <option value="newest">Newest First</option>
        </select>
      </div>
    </div>
  );
}

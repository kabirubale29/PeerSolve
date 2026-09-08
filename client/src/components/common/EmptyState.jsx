import React from 'react';
import { HelpCircle, MessageSquarePlus } from 'lucide-react';

export default function EmptyState({
  icon = <HelpCircle className="w-10 h-10 text-slate-300" />,
  title = "No doubts found",
  description = "Be the first person to ask or answer a question in this category.",
  actionText = null,
  onAction = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <MessageSquarePlus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}

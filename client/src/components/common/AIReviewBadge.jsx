import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, HelpCircle, X, Sparkles } from 'lucide-react';

export default function AIReviewBadge({ status = 'unavailable', feedback = '' }) {
  const [showModal, setShowModal] = useState(false);

  const config = {
    reviewed: {
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      label: 'AI Reviewed',
      title: 'AI Verification: No Obvious Issues Detected'
    },
    needs_review: {
      bg: 'bg-amber-50 hover:bg-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      label: 'Needs Review',
      title: 'AI Verification: Further Clarification Needed'
    },
    potential_issue: {
      bg: 'bg-rose-50 hover:bg-rose-100',
      border: 'border-rose-200',
      text: 'text-rose-800',
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
      label: 'Potential Issue Detected',
      title: 'AI Verification: Potential Factual or Logical Issue'
    },
    unavailable: {
      bg: 'bg-slate-100 hover:bg-slate-200',
      border: 'border-slate-200',
      text: 'text-slate-700',
      icon: <HelpCircle className="w-4 h-4 text-slate-500" />,
      label: 'AI Review Unavailable',
      title: 'AI Service Notice'
    }
  };

  const current = config[status] || config.unavailable;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${current.bg} ${current.border} ${current.text}`}
        title="Click to view AI advisory analysis"
      >
        {current.icon}
        <span>{current.label}</span>
      </button>

      {/* Advisory Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{current.title}</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className={`p-4 rounded-xl border text-sm leading-relaxed ${
                status === 'potential_issue' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                status === 'needs_review' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                status === 'reviewed' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {feedback || 'No detailed feedback provided.'}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Notice:</span> AI verification is advisory only, designed to help students and authors spot potential inaccuracies. It is never an absolute guarantee of correctness. The academic community validates answers through upvotes, accepted answers, and peer review.
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

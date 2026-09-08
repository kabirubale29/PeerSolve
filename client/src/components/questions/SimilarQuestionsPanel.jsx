import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  XCircle,
  ThumbsUp
} from 'lucide-react';

export default function SimilarQuestionsPanel({
  matches = [],
  isLoading = false,
  onDismiss,
  onSelectSoftLink,
  selectedSoftLinks = []
}) {
  if (isLoading) {
    return (
      <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 my-4 animate-pulse">
        <div className="flex items-center gap-2 text-indigo-800 text-sm font-bold mb-2">
          <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
          Checking peer knowledge base for existing answers...
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-indigo-200/50 rounded w-3/4"></div>
          <div className="h-4 bg-indigo-200/40 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-indigo-50/80 to-white border-2 border-indigo-200 rounded-2xl p-5 my-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>Similar Doubts Already Found in Community Knowledge</span>
        </div>
        <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
          Advisory Check
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-4 leading-relaxed">
        Before posting a duplicate question, check if your doubt was already answered. If an existing answer helps you, you don't need to wait for a reply!
      </p>

      {/* Matches List */}
      <div className="space-y-2.5">
        {matches.map(match => {
          const isSolved = match.status === 'solved';
          const isLinked = selectedSoftLinks.includes(match.id);

          return (
            <div
              key={match.id}
              className="group p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isSolved ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Solved
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Open
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    {match.subject}
                  </span>
                  {match.similarity && (
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">
                      {Math.round(match.similarity * 100)}% match
                    </span>
                  )}
                </div>

                <a
                  href={`/question/${match.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1 leading-snug"
                >
                  <span>{match.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </a>

                <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                  {match.description}
                </p>
              </div>

              {/* Soft Link Toggle Button */}
              {onSelectSoftLink && (
                <button
                  type="button"
                  onClick={() => onSelectSoftLink(match.id)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-colors flex-shrink-0 ${
                    isLinked
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title="Link as a related question so future students can cross-reference"
                >
                  {isLinked ? '✓ Linked' : '+ Link Related'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Free choice action: Dismiss & Continue */}
      <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-slate-500">
          None of these quite resolve your doubt?
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-bold text-indigo-700 hover:text-indigo-900 hover:underline flex items-center gap-1"
        >
          <span>Continue asking your own question</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

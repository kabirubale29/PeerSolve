import React, { useState } from 'react';
import { Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AIImproveButton({
  title,
  description,
  subject,
  tags,
  onApplyChanges
}) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const { showToast } = useToast();

  const handleImprove = async () => {
    if (!title || title.trim().length < 5) {
      showToast('Please enter at least a brief question title first.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.improveQuestion({
        title,
        description,
        subject,
        tags
      });

      if (res.success && res.data) {
        setSuggestions(res.data);
        setModalOpen(true);
      } else {
        showToast(res.message || 'Unable to improve question right now.', 'warning');
      }
    } catch (err) {
      showToast('AI improvement is temporarily unavailable.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestions) {
      onApplyChanges({
        title: suggestions.improvedTitle || title,
        description: suggestions.improvedDescription || description,
        subject: suggestions.suggestedSubject || subject,
        tags: suggestions.suggestedTags || tags
      });
      showToast('AI suggestions approved and applied!', 'success');
      setModalOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={handleImprove}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
      >
        <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'Analyzing with AI...' : '✨ Improve with AI'}</span>
      </button>

      {/* Review Modal before Applying */}
      {modalOpen && suggestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Review AI Improvements</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Review suggested revisions for clarity and searchable tags. You must approve these changes before they are applied.
            </p>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Title Comparison */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Suggested Title</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{suggestions.improvedTitle}</p>
              </div>

              {/* Description Comparison */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Refined Description</span>
                <p className="text-xs text-slate-700 whitespace-pre-line mt-0.5 leading-relaxed">{suggestions.improvedDescription}</p>
              </div>

              {/* Subject & Tags */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Subject</span>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">{suggestions.suggestedSubject}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Suggested Tags</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(suggestions.suggestedTags || []).map(t => (
                      <span key={t} className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Keep My Original Draft
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Apply Revisions</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

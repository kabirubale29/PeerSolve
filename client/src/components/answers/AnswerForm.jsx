import React, { useState } from 'react';
import { Send, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AnswerForm({ questionId, onAnswerSubmitted }) {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, profile } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in or select a demo role to write an answer.', 'warning');
      return;
    }

    if (!content.trim() || content.trim().length < 15) {
      showToast('Please provide a thoughtful answer of at least 15 characters.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitAnswer({
        question_id: questionId,
        content: content.trim(),
        is_anonymous: isAnonymous
      });

      showToast('Answer submitted! Advisory AI verification completed.', 'success');
      setContent('');
      setIsAnonymous(false);
      if (onAnswerSubmitted) {
        onAnswerSubmitted(res.answer);
      }
    } catch (err) {
      showToast(err.message || 'Unable to submit your answer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <span>Your Answer</span>
          <span className="text-xs font-normal text-slate-400">
            (Any junior or senior peer can answer)
          </span>
        </h3>

        <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Advisory Review on submit</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Explain the concept clearly, provide intuition or code snippets if relevant..."
            rows={5}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-y"
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Post anonymously (Reputation still accrues to your account)
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Verifying with AI...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Post Answer</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">Peer Knowledge Tip:</span> High quality answers receive upvotes (+5 Rep) and can be accepted by the author (+25 Rep). AI review checks for factual accuracy without blocking your submission.
        </div>
      </form>
    </div>
  );
}

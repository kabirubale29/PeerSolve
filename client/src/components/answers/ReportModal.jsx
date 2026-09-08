import React, { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const REPORT_REASONS = [
  'Incorrect information',
  'Misleading explanation',
  'Incomplete answer',
  'Plagiarized or spam content',
  'Other'
];

export default function ReportModal({ answerId, isOpen, onClose, onReportSuccess }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.submitReport({
        answer_id: answerId,
        reason,
        proof: proof.trim()
      });

      showToast(res.message || 'Report submitted for review.', 'info');
      if (onReportSuccess) {
        onReportSuccess(res);
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Unable to submit report.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <Flag className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Report Inaccurate Answer</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reason for Report
            </label>
            <div className="space-y-1.5">
              {REPORT_REASONS.map(r => (
                <label
                  key={r}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm cursor-pointer transition-all ${
                    reason === r
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Explanation & Supporting Source (Optional)
            </label>
            <textarea
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="e.g. For sorted arrays, standard binary search is O(log n), not O(n)..."
              rows={3}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none resize-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Answers with 3+ reports from distinct peers are marked "Under Review" pending author correction.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

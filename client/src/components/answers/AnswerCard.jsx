import React, { useState } from 'react';
import {
  CheckCircle,
  Flag,
  Edit3,
  Trash2,
  AlertTriangle,
  Sparkles,
  Save,
  X
} from 'lucide-react';
import RoleBadge from '../common/RoleBadge';
import ReputationBadge from '../common/ReputationBadge';
import VoteButtons from '../common/VoteButtons';
import AIReviewBadge from '../common/AIReviewBadge';
import CommentSection from './CommentSection';
import ReportModal from './ReportModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export default function AnswerCard({
  answer,
  isQuestionOwner = false,
  onAcceptToggle,
  onAnswerUpdated,
  onAnswerDeleted
}) {
  const { profile, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [editAnonymous, setEditAnonymous] = useState(answer.author?.isAnonymous || false);
  const [saving, setSaving] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const author = answer.author || {};
  const isOwnAnswer = profile?.id === author.id;
  const isAccepted = answer.is_accepted;
  const isUnderReview = answer.is_under_review;

  // Handle Edit Submission (Triggers AI re-verification on backend)
  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      showToast('Answer content cannot be empty.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateAnswer(answer.id, {
        content: editContent.trim(),
        is_anonymous: editAnonymous
      });

      showToast('Answer updated and re-verified by AI.', 'success');
      setIsEditing(false);
      if (onAnswerUpdated) {
        onAnswerUpdated(res.answer);
      }
    } catch (err) {
      showToast(err.message || 'Unable to update answer.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    try {
      await api.deleteAnswer(answer.id);
      showToast('Answer deleted.', 'info');
      if (onAnswerDeleted) {
        onAnswerDeleted(answer.id);
      }
    } catch (err) {
      showToast('Unable to delete answer.', 'error');
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all p-5 mb-4 ${
        isAccepted
          ? 'bg-emerald-50/40 border-emerald-300 shadow-sm ring-1 ring-emerald-400/30'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Accepted Answer Banner */}
      {isAccepted && (
        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-3 pb-2 border-b border-emerald-200/60">
          <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
          <span>✓ Accepted Answer — Solved by Community Peer</span>
        </div>
      )}

      {/* Under Review Flag (if 3+ reports) */}
      {isUnderReview && (
        <div className="flex items-center gap-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs font-semibold mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Under Community Review: Multiple students reported potential inaccuracies in this explanation.</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Left: Vote Buttons */}
        <div className="flex flex-col items-center gap-2">
          <VoteButtons
            targetType="answer"
            targetId={answer.id}
            initialScore={answer.score ?? (answer.upvote_count - answer.downvote_count)}
            initialVote={answer.user_vote}
            isOwner={isOwnAnswer}
            orientation="vertical"
          />

          {/* Accept Answer Action (Question Owner Only, cannot accept own answer) */}
          {isQuestionOwner && !isOwnAnswer && (
            <button
              type="button"
              onClick={() => onAcceptToggle(answer.id)}
              className={`p-2 rounded-xl transition-all ${
                isAccepted
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title={isAccepted ? "Click to unaccept" : "Mark as accepted answer (+25 Rep to answerer)"}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Right: Answer Content & Header */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Author + AI Review Badge */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <img
                src={author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                alt={author.name}
                className="w-6 h-6 rounded-full bg-slate-200 object-cover"
              />
              <span className={`text-xs font-bold ${author.isAnonymous ? 'text-slate-500 italic' : 'text-slate-900'}`}>
                {author.name}
              </span>
              <RoleBadge role={author.role} size="sm" />
              {!author.isAnonymous && <ReputationBadge reputation={author.reputation} size="sm" />}
            </div>

            {/* AI Review Badge */}
            <div className="flex items-center gap-2">
              <AIReviewBadge
                status={answer.ai_status}
                feedback={answer.ai_feedback}
              />
            </div>
          </div>

          {/* Body Content / Edit Form */}
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-sans focus:border-emerald-500 focus:bg-white outline-none resize-y"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editAnonymous}
                    onChange={(e) => setEditAnonymous(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Post anonymously</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveEdit}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Re-verifying...' : 'Save & Re-verify'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal break-words">
              {answer.content}
            </div>
          )}

          {/* Action Row: Author Edit/Delete & Peer Report */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="text-[11px] text-slate-400">
              Answered {new Date(answer.created_at).toLocaleDateString()}
            </span>

            <div className="flex items-center gap-3">
              {isOwnAnswer && !isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}

              {/* Report Action */}
              {!isOwnAnswer && isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1"
                  title="Report inaccurate or misleading explanation"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Clarification Comments */}
          <CommentSection answerId={answer.id} />
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        answerId={answer.id}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onReportSuccess={() => {
          answer.report_count = (answer.report_count || 0) + 1;
        }}
      />
    </div>
  );
}

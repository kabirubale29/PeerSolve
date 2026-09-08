import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function VoteButtons({
  targetType = 'question',
  targetId,
  initialScore = 0,
  initialVote = null,
  isOwner = false,
  orientation = 'vertical',
  onVoteSuccess
}) {
  const [score, setScore] = useState(initialScore);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleVote = async (type) => {
    if (!isAuthenticated) {
      showToast('Please log in to vote on academic doubts.', 'warning');
      return;
    }

    if (isOwner) {
      showToast(`You cannot vote on your own ${targetType}.`, 'warning');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await api.castVote({
        target_type: targetType,
        target_id: targetId,
        vote_type: type
      });

      setCurrentVote(res.current_vote);
      setScore(res.score);
      if (onVoteSuccess) {
        onVoteSuccess(res);
      }
    } catch (err) {
      showToast(err.message || 'Unable to register vote.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`flex items-center gap-1 ${
        isVertical ? 'flex-col bg-slate-50 border border-slate-200 rounded-xl p-1.5' : 'flex-row'
      }`}
    >
      {/* Upvote Button */}
      <button
        type="button"
        disabled={loading || isOwner}
        onClick={() => handleVote('up')}
        className={`p-1.5 rounded-lg transition-all ${
          currentVote === 'up'
            ? 'bg-emerald-500 text-white shadow-sm'
            : isOwner
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
        }`}
        title={isOwner ? "You cannot vote on your own content" : "Upvote this helpful doubt or answer"}
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Score Count */}
      <span
        className={`font-mono font-bold text-xs ${
          score > 0
            ? 'text-emerald-600'
            : score < 0
            ? 'text-rose-600'
            : 'text-slate-600'
        } ${isVertical ? 'my-0.5' : 'mx-1'}`}
      >
        {score}
      </span>

      {/* Downvote Button */}
      <button
        type="button"
        disabled={loading || isOwner}
        onClick={() => handleVote('down')}
        className={`p-1.5 rounded-lg transition-all ${
          currentVote === 'down'
            ? 'bg-rose-500 text-white shadow-sm'
            : isOwner
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
        }`}
        title={isOwner ? "You cannot vote on your own content" : "Downvote if inaccurate or misleading"}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}

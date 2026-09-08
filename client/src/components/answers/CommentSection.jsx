import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CommentSection({ answerId }) {
  const [comments, setComments] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const { profile, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    api.getComments(answerId)
      .then(res => setComments(res.comments || []))
      .catch(() => {});
  }, [answerId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to leave a clarification comment.', 'warning');
      return;
    }
    if (!newContent.trim()) return;

    setLoading(true);
    try {
      const res = await api.addComment({
        answer_id: answerId,
        content: newContent.trim()
      });
      setComments(prev => [...prev, res.comment]);
      setNewContent('');
      setShowInput(false);
      showToast('Comment added.', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to post comment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      showToast('Comment removed.', 'info');
    } catch (err) {
      showToast('Unable to delete comment.', 'error');
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
      {/* Existing Comments */}
      {comments.length > 0 && (
        <div className="space-y-2 mb-3">
          {comments.map(c => {
            const isOwn = profile?.id === c.author?.id;
            return (
              <div key={c.id} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <img
                    src={c.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={c.author?.name}
                    className="w-4 h-4 rounded-full bg-slate-200 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 mr-1.5">{c.author?.name}:</span>
                    <span className="text-slate-600 leading-relaxed">{c.content}</span>
                  </div>
                </div>

                {isOwn && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment CTA / Form */}
      {showInput ? (
        <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Ask for clarification on this answer..."
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !newContent.trim()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1 disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>Post</span>
          </button>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="px-2 py-1.5 text-slate-500 hover:text-slate-700 font-medium"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Add a clarification comment ({comments.length})</span>
        </button>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  Sparkles,
  Link as LinkIcon,
  Shield,
  Trash2,
  Edit3
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import RoleBadge from '../components/common/RoleBadge';
import ReputationBadge from '../components/common/ReputationBadge';
import VoteButtons from '../components/common/VoteButtons';
import AnswerCard from '../components/answers/AnswerCard';
import AnswerForm from '../components/answers/AnswerForm';
import AnswerSortSelector from '../components/answers/AnswerSortSelector';
import EmptyState from '../components/common/EmptyState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortMethod, setSortMethod] = useState('recommended');

  // Load question and its answers
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const qRes = await api.getQuestion(id);
      setQuestion(qRes);

      const aRes = await api.getAnswers(id, sortMethod);
      setAnswers(aRes.answers || []);
    } catch (err) {
      showToast(err.message || 'Unable to load question details.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, sortMethod, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Accept/Unaccept answer
  const handleAcceptToggle = async (answerId) => {
    try {
      const res = await api.acceptAnswer(answerId);
      showToast(res.message, 'success');
      loadData(); // reload answers & question solved status
    } catch (err) {
      showToast(err.message || 'Unable to accept answer.', 'error');
    }
  };

  // Handle Question Delete
  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this doubt?')) return;
    try {
      await api.deleteQuestion(id);
      showToast('Question deleted.', 'info');
      navigate('/dashboard');
    } catch (err) {
      showToast('Unable to delete question.', 'error');
    }
  };

  if (loading && !question) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
          <EmptyState
            title="Question not found"
            description="This doubt may have been removed by its author."
            actionText="Back to Feed"
            onAction={() => navigate('/dashboard')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const isSolved = question.status === 'solved';
  const author = question.author || {};
  const isQuestionOwner = question.is_owner;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doubts</span>
        </button>

        {/* Question Container Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* Top Status & Tags Row */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {question.subject}
              </span>
              {isSolved ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Solved
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  Open Doubt
                </span>
              )}
              {question.topic && (
                <span className="text-xs text-slate-400 font-medium">
                  • {question.topic}
                </span>
              )}
            </div>

            {/* Owner Actions */}
            {isQuestionOwner && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteQuestion}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Question Title */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {question.title}
          </h1>

          {/* Author and Date Meta */}
          <div className="mt-4 pb-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <img
                src={author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                alt={author.name}
                className="w-7 h-7 rounded-full bg-slate-200 object-cover"
              />
              <span className={`font-bold ${author.isAnonymous ? 'text-slate-500 italic' : 'text-slate-900'}`}>
                {author.name}
              </span>
              <RoleBadge year={author.year} role={author.role} size="sm" />
              {!author.isAnonymous && <ReputationBadge reputation={author.reputation} size="sm" />}
            </div>

            <div className="flex items-center gap-4 text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(question.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {question.views} views
              </span>
            </div>
          </div>

          {/* Question Body + Vote Section */}
          <div className="mt-6 flex items-start gap-4">
            <VoteButtons
              targetType="question"
              targetId={question.id}
              initialScore={question.score ?? (question.upvote_count - question.downvote_count)}
              initialVote={question.user_vote}
              isOwner={isQuestionOwner}
              orientation="vertical"
              onVoteSuccess={(res) => {
                setQuestion(prev => ({
                  ...prev,
                  score: res.score,
                  upvote_count: res.upvote_count,
                  downvote_count: res.downvote_count,
                  user_vote: res.current_vote
                }));
              }}
            />

            <div className="flex-1 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal break-words">
              {question.description}
            </div>
          </div>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {question.tags.map(t => (
                <span
                  key={t}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Soft-linked Related Questions (Section 8) */}
          {question.related_questions && question.related_questions.length > 0 && (
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Related Doubts Soft-Linked by Peers</span>
              </div>
              <div className="space-y-1.5">
                {question.related_questions.map(rq => (
                  <Link
                    key={rq.id}
                    to={`/question/${rq.id}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
                  >
                    <span>{rq.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{rq.subject}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Answers Header & Sort Selector */}
        <div className="mt-8">
          <AnswerSortSelector
            currentSort={sortMethod}
            onSortChange={setSortMethod}
            totalAnswers={answers.length}
          />

          {/* Answers List */}
          <div className="mt-4">
            {answers.length === 0 ? (
              <EmptyState
                title="No answers yet"
                description="Be the first peer or senior mentor to help this student resolve their doubt!"
              />
            ) : (
              answers.map(ans => (
                <AnswerCard
                  key={ans.id}
                  answer={ans}
                  isQuestionOwner={isQuestionOwner}
                  onAcceptToggle={handleAcceptToggle}
                  onAnswerUpdated={loadData}
                  onAnswerDeleted={(delId) => setAnswers(prev => prev.filter(a => a.id !== delId))}
                />
              ))
            )}
          </div>

          {/* Write Answer Form */}
          <AnswerForm
            questionId={question.id}
            onAnswerSubmitted={() => loadData()}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

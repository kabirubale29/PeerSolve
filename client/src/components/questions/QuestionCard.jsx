import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  CheckCircle2,
  Eye,
  Clock,
  User,
  Sparkles,
  ArrowUp
} from 'lucide-react';
import RoleBadge from '../common/RoleBadge';
import ReputationBadge from '../common/ReputationBadge';
import VoteButtons from '../common/VoteButtons';

export default function QuestionCard({ question, onVoteChange }) {
  const isSolved = question.status === 'solved';
  const author = question.author || {};

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        {/* Vote Buttons on Question */}
        <div className="hidden sm:block">
          <VoteButtons
            targetType="question"
            targetId={question.id}
            initialScore={question.score ?? (question.upvote_count - question.downvote_count)}
            initialVote={question.user_vote}
            orientation="vertical"
            onVoteSuccess={onVoteChange}
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Metadata Row: Subject, Status, Topic */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              {question.subject}
            </span>

            {isSolved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Solved
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                Open Doubt
              </span>
            )}

            {question.topic && (
              <span className="text-xs text-slate-400 font-medium">
                • {question.topic}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/question/${question.id}`}
            className="block text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors leading-snug line-clamp-2"
          >
            {question.title}
          </Link>

          {/* Description Preview */}
          <p className="mt-1.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {question.description}
          </p>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {question.tags.map(t => (
                <span
                  key={t}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Footer Row: Author info, Answers count, Views */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-500">
            {/* Author */}
            <div className="flex items-center gap-2">
              <img
                src={author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                alt={author.name}
                className="w-5 h-5 rounded-full bg-slate-200 object-cover"
              />
              <span className={`font-semibold ${author.isAnonymous ? 'text-slate-500 italic' : 'text-slate-700'}`}>
                {author.name}
              </span>
              <RoleBadge year={author.year} role={author.role} size="sm" />
              {!author.isAnonymous && <ReputationBadge reputation={author.reputation} size="sm" />}
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1" title="Views">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {question.views || 0}
              </span>
              <span className={`flex items-center gap-1 font-semibold ${
                question.has_accepted_answer
                  ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md'
                  : 'text-slate-600'
              }`}>
                <MessageSquare className="w-3.5 h-3.5" />
                {question.answer_count || 0} answers
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

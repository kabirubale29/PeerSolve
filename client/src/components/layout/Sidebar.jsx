import React from 'react';
import {
  BookOpen,
  Hash,
  Award,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RoleBadge from '../common/RoleBadge';
import ReputationBadge from '../common/ReputationBadge';

const SUBJECTS = [
  'All',
  'Java',
  'Python',
  'Data Structures',
  'Algorithms',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'Mathematics',
  'Electronics',
  'Other'
];

const TRENDING_TAGS = [
  'Polymorphism',
  'BinarySearch',
  'Overriding',
  'Threads',
  'Normalization',
  'TCP',
  'VirtualMemory'
];

export default function Sidebar({ selectedSubject = 'All', onSelectSubject, selectedTag, onSelectTag }) {
  const { profile, isAuthenticated } = useAuth();

  return (
    <aside className="w-full space-y-6">
      {/* User Quick Stats Widget (if logged in) */}
      {isAuthenticated && profile && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
              alt={profile.name}
              className="w-12 h-12 rounded-xl bg-slate-100 object-cover border border-slate-100"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">{profile.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Year {profile.year} • {profile.branch}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <RoleBadge role={profile.role} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-base font-extrabold text-slate-900">{profile.reputation || 0}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Reputation</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-base font-extrabold text-emerald-600">{profile.stats?.accepted_answers_count || 0}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Accepted</span>
            </div>
          </div>
        </div>
      )}

      {/* Subject Categories */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Subjects</h3>
        </div>
        <div className="space-y-1">
          {SUBJECTS.map(subj => {
            const isSelected = selectedSubject.toLowerCase() === subj.toLowerCase();
            return (
              <button
                key={subj}
                type="button"
                onClick={() => onSelectSubject(subj)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{subj}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Doubt Tags */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trending Doubt Topics</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TRENDING_TAGS.map(tag => {
            const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Community Principles Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold">Peer Knowledge Rule</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Ask once publicly or anonymously. Answers are verified by AI and validated by peer upvotes. Doubts turn into reusable study notes for your juniors.
        </p>
      </div>
    </aside>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  Star,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  BookOpen,
  Calendar,
  Shield,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import RoleBadge from '../components/common/RoleBadge';
import ReputationBadge from '../components/common/ReputationBadge';
import EmptyState from '../components/common/EmptyState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { id } = useParams();
  const { profile: myProfile } = useAuth();
  const { showToast } = useToast();

  const isSelf = !id || id === myProfile?.id;
  const [profileData, setProfileData] = useState(isSelf ? myProfile : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        if (isSelf) {
          const res = await api.getMyProfile();
          setProfileData(res.profile);
        } else {
          const res = await api.getUserProfile(id);
          setProfileData(res.profile);
        }
      } catch (err) {
        showToast('Unable to load user profile.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [id, isSelf, showToast]);

  if (loading && !profileData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 animate-pulse space-y-4">
          <div className="h-32 bg-slate-200 rounded-3xl"></div>
          <div className="h-64 bg-slate-200 rounded-3xl"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
          <EmptyState title="Profile not found" />
        </main>
        <Footer />
      </div>
    );
  }

  const stats = profileData.stats || {
    questions_count: 0,
    answers_count: 0,
    accepted_answers_count: 0,
    total_upvotes: 0
  };

  const badges = profileData.badges || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <img
              src={profileData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
              alt={profileData.name}
              className="w-24 h-24 rounded-3xl bg-slate-100 object-cover border-2 border-emerald-500/20 shadow-sm"
            />

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900">{profileData.name}</h1>
                <div className="flex items-center gap-2">
                  <RoleBadge role={profileData.role} size="lg" />
                  <ReputationBadge reputation={profileData.reputation || 0} size="lg" />
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium mt-1">
                Year {profileData.year} Student • {profileData.branch}
              </p>

              {profileData.bio && (
                <p className="text-sm text-slate-600 mt-3 max-w-xl leading-relaxed">
                  "{profileData.bio}"
                </p>
              )}

              {/* Subject Interests */}
              {profileData.subjects && profileData.subjects.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="text-xs font-bold text-slate-400 mr-1">Expertise & Interests:</span>
                  {profileData.subjects.map(s => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="block text-xl font-extrabold text-amber-600">
                ⭐ {profileData.reputation || 0}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Reputation
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="block text-xl font-extrabold text-emerald-600">
                {stats.accepted_answers_count}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Accepted Answers
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="block text-xl font-extrabold text-indigo-600">
                {stats.total_upvotes}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Upvotes Received
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="block text-xl font-extrabold text-slate-900">
                {stats.questions_count}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Questions Asked
              </span>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Earned Community Badges</h2>
          </div>

          {badges.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No badges earned yet. Answer peer doubts to unlock badges!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map(b => (
                <div
                  key={b.slug}
                  className="p-4 bg-gradient-to-br from-amber-50/50 to-white rounded-2xl border border-amber-200 flex items-start gap-3"
                >
                  <span className="text-2xl">{b.icon}</span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{b.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contributions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Public Contributions</h2>
            {isSelf && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Anonymous posts are hidden from public viewers
              </span>
            )}
          </div>

          <div className="space-y-3">
            {(profileData.recent_questions || []).map(q => (
              <Link
                key={q.id}
                to={`/question/${q.id}`}
                className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {q.subject}
                  </span>
                  {q.is_anonymous && (
                    <span className="text-[10px] italic text-slate-400">
                      (You asked this anonymously)
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{q.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

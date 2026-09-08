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
  Sparkles,
  ArrowRight,
  Eye,
  Clock
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import RoleBadge from '../components/common/RoleBadge';
import ReputationBadge from '../components/common/ReputationBadge';
import AIReviewBadge from '../components/common/AIReviewBadge';
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
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'answers', 'badges'

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
  const userQuestions = profileData.questions || profileData.recent_questions || [];
  const userAnswers = profileData.answers || profileData.recent_answers || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
                  <RoleBadge year={profileData.year} role={profileData.role} size="lg" showDetailed={true} />
                  <ReputationBadge reputation={profileData.reputation || 0} size="lg" />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-600 font-medium mt-2">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-bold text-slate-800">
                  {profileData.degree || 'B.Tech'}
                </span>
                <span>•</span>
                <span>{profileData.branch}</span>
                <span>•</span>
                <span>Year {profileData.year}</span>
                {profileData.age && (
                  <>
                    <span>•</span>
                    <span>Age {profileData.age}</span>
                  </>
                )}
              </div>

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
                Accepted Solutions
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
                Doubts Asked
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Activity Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'questions'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Questions Asked</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                activeTab === 'questions' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {userQuestions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('answers')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'answers'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Answers Provided</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                activeTab === 'answers' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {userAnswers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('badges')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'badges'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Badges</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                activeTab === 'badges' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {badges.length}
              </span>
            </button>
          </div>

          {isSelf && (
            <span className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Your private activity is safely masked
            </span>
          )}
        </div>

        {/* TAB CONTENT: 1. Questions Asked */}
        {activeTab === 'questions' && (
          <div className="space-y-3">
            {userQuestions.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No questions asked yet</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Have a doubt in your coursework? Ask the university community!
                </p>
                {isSelf && (
                  <Link
                    to="/ask"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    <span>Ask Your First Doubt</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              userQuestions.map(q => (
                <Link
                  key={q.id}
                  to={`/question/${q.id}`}
                  className="block p-4 rounded-2xl bg-white hover:border-emerald-300 border border-slate-200 shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {q.subject}
                      </span>
                      {q.status === 'solved' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Solved
                        </span>
                      ) : (
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          Open Doubt
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      {q.is_anonymous && (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Shield className="w-3 h-3 text-emerald-600" />
                          Asked Anonymously
                        </span>
                      )}
                      <span>{new Date(q.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mt-1">
                    {q.title}
                  </h3>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 font-medium">
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                        {q.upvote_count || 0} upvotes
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        {q.answer_count || 0} answers
                      </span>
                    </div>
                    <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      View Doubt &rarr;
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* TAB CONTENT: 2. Answers Provided */}
        {activeTab === 'answers' && (
          <div className="space-y-3">
            {userAnswers.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No answers contributed yet</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Help fellow students solve their doubts and earn reputation points & badges!
                </p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <span>Explore Doubts to Answer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              userAnswers.map(a => (
                <Link
                  key={a.id}
                  to={`/question/${a.question_id}`}
                  className="block p-4 rounded-2xl bg-white hover:border-emerald-300 border border-slate-200 shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between text-xs mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        {a.question_subject || 'Academic'}
                      </span>
                      {a.is_accepted && (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Accepted Solution (+25 Rep)
                        </span>
                      )}
                      <AIReviewBadge status={a.ai_status} feedback={a.ai_feedback} />
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      {a.is_anonymous && (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Shield className="w-3 h-3 text-emerald-600" />
                          Answered Anonymously
                        </span>
                      )}
                      <span>{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Question: <span className="text-slate-800 normal-case">{a.question_title}</span>
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 line-clamp-2 leading-relaxed">
                    "{a.content_preview || a.content}"
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                      {a.upvote_count || 0} upvotes received
                    </span>
                    <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Open Discussion &rarr;
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* TAB CONTENT: 3. Earned Badges */}
        {activeTab === 'badges' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Earned Community Badges</h2>
            </div>

            {badges.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No badges earned yet.</p>
                <p className="text-xs text-slate-400 mt-0.5">Answer peer doubts and get accepted answers to unlock badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {badges.map(b => (
                  <div
                    key={b.slug}
                    className="p-4 bg-gradient-to-br from-amber-50/50 to-white rounded-2xl border border-amber-200 flex items-start gap-3 shadow-sm"
                  >
                    <span className="text-3xl">{b.icon}</span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{b.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

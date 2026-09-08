import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  MessageSquare,
  Sparkles,
  Award,
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  GraduationCap,
  FileQuestion,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Top Pre-login Navbar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            Peer<span className="text-emerald-600">Solve</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 mr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Signed in as <strong className="text-slate-800">{profile?.full_name || 'Student'}</strong></span>
              </div>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
              >
                Go to Dashboard &rarr;
              </Link>
              <button
                onClick={logout}
                className="px-3.5 py-2 text-sm font-bold text-slate-600 hover:text-rose-600 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Academic Doubt-Solving Platform for University Students
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
          Ask once. Get answered by peers & seniors.
          <span className="block text-emerald-600 mt-2">
            Never repeat the same doubt again.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The student-focused academic Q&A community where private chat doubts turn into reusable university knowledge, backed by advisory AI verification.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/ask"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base rounded-2xl transition-all"
              >
                Ask a Doubt
              </Link>
              <button
                onClick={logout}
                className="w-full sm:w-auto px-6 py-3.5 text-slate-500 hover:text-rose-600 font-semibold text-sm transition-all"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Create Account Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-base rounded-2xl shadow-sm transition-all"
              >
                Log In
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base rounded-2xl transition-all"
              >
                Explore Public Doubts
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 2. THE PROBLEM FRAMING */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
              The Real Problem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 leading-snug">
              Why do 50 students ask the same question in 50 private chats?
            </h2>
            <p className="mt-4 text-slate-300 text-base leading-relaxed">
              Students often have small academic doubts but hesitate to ask in class. They message classmates or seniors individually. The same doubt gets explained 10 times, and the answer disappears into private chat history instead of helping everyone.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (4-STEP LOOP) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
            Simple Knowledge Loop
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            How PeerSolve Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              Search First
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Type your doubt. Our advisory semantic search detects existing solved answers in real-time.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              Ask Freely
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              If existing answers don't quite fit, post your question openly or anonymously without fear of embarrassment.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Peer Answer + AI
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Juniors and seniors answer. Gemini AI reviews answers as an advisory check for factual accuracy.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg mb-4">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Solved & Reused
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Author accepts the best answer (+25 Rep). The solution becomes permanently searchable for future batches.
            </p>
          </div>
        </div>
      </section>

      {/* 4. KEY DIFFERENTIATORS */}
      <section className="bg-slate-50 border-t border-b border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
              Core Differentiators
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Built for Real Student Needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Anonymous Asking & Answering</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Post doubts anonymously while reputation still accrues to your verified university profile behind the scenes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Advisory AI Verification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Spot factual inaccuracies (like confusing binary search with linear search) immediately with color-coded AI tags.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Senior Mentorship & Trust</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Junior students see clear badges for Senior Mentors, while seniors build credible academic portfolios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gradient-to-tr from-emerald-700 to-teal-800 text-white rounded-3xl p-10 sm:p-16 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold max-w-xl mx-auto leading-tight">
            Ready to solve academic doubts together?
          </h2>
          <p className="mt-4 text-emerald-100 text-base max-w-md mx-auto">
            Join your university peers and start building reusable knowledge today.
          </p>
          <div className="mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-sm rounded-2xl shadow-lg transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MessageSquare,
  Sparkles,
  Award,
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  GraduationCap,
  Zap,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';
import SolarOrbits from '../components/common/SolarOrbits';

export default function LandingPage() {
  const { isAuthenticated, profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1612] bg-dot-pattern selection:bg-amber-100 selection:text-amber-900 relative overflow-x-hidden">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between relative z-30">
        <BrandLogo size="md" showTagline={true} />

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
          <a href="#how-it-works" className="hover:text-amber-700 transition-colors">How it works</a>
          <a href="#features" className="hover:text-amber-700 transition-colors">Features</a>
          <a href="#problem" className="hover:text-amber-700 transition-colors">The Problem</a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 mr-2 bg-white/70 px-3 py-1.5 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Signed in as <strong className="text-slate-900">{profile?.name || 'Student'}</strong></span>
              </div>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-amber-600/25 transition-all"
              >
                Dashboard &rarr;
              </Link>
              <button
                onClick={logout}
                className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-2.5 bg-white/80 hover:bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-bold rounded-full shadow-sm backdrop-blur-sm transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex px-6 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-amber-600/20 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 1. HERO SECTION WITH SPINNING SOLAR ORBITS (Image 4 Exact Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-24 text-center relative z-20 min-h-[78vh] flex flex-col items-center justify-center">
        {/* Animated Solar System Orbital Background */}
        <SolarOrbits centered={true} className="opacity-90" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Glowing Pill Tag matching Image 4 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/70 border border-amber-300/80 text-amber-900 text-xs font-bold tracking-wide mb-8 shadow-sm backdrop-blur-sm animate-float-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>Intelligent Academic Peer Network</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          </div>

          {/* Giant Editorial Serif Headline matching Image 4 */}
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto">
            Your Doubts.{' '}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 bg-clip-text text-transparent font-serif italic block sm:inline">
              Solved for You.
            </span>
          </h1>

          {/* Clean Subtitle */}
          <p className="mt-8 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            PeerSolve turns university doubt-solving into a structured, intelligent community journey. No confusion. No repeated private chats. Just clear answers backed by advisory AI validation.
          </p>

          {/* Hero Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-600/25 hover:shadow-amber-600/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5"
                >
                  <span>Go to Doubts Feed</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/ask"
                  className="w-full sm:w-auto px-7 py-4 bg-white/90 hover:bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm sm:text-base rounded-2xl shadow-sm transition-all"
                >
                  Ask a Doubt
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-600/25 hover:shadow-amber-600/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5"
                >
                  <span>Start Your Journey — Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-7 py-4 bg-white/90 hover:bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm sm:text-base rounded-2xl shadow-sm transition-all"
                >
                  Explore Public Doubts
                </Link>
              </>
            )}
          </div>

          {/* Mouse Scroll Indicator matching Image 4 */}
          <div className="mt-20 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              SCROLL
            </span>
            <div className="w-5 h-8 rounded-full border-2 border-slate-400 flex items-start justify-center p-1">
              <div className="w-1.5 h-2 bg-amber-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS 4-STEP LOOP (Image 1 Exact Layout) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Blue Pill Badge matching Image 1 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-4 shadow-sm">
            <span>How It Works</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            From doubt to solution{' '}
            <span className="font-serif italic font-normal text-slate-700">in 10 minutes</span>
          </h2>

          <p className="mt-4 text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
            Four simple steps. No technical barrier. Just search, ask freely, and learn from peers.
          </p>
        </div>

        {/* 4 Connected Step Cards matching Image 1 */}
        <div className="relative">
          {/* Connecting Line behind the numbers */}
          <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-amber-300 via-purple-300 to-emerald-300 z-0"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Step 01: Warm Peach */}
            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-2xl bg-[#FDF3E7] border border-[#F5D5B5] text-[#C86200] font-serif font-extrabold text-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                01
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
                Search First
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Type your doubt. Our debounced semantic vector search checks existing university answers in real time.
              </p>
            </div>

            {/* Step 02: Soft Lavender */}
            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-2xl bg-[#F6EEFA] border border-[#E8D4F3] text-[#7E22CE] font-serif font-extrabold text-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                02
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
                Ask Anonymously
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Can't find an existing answer? Post with 1-click anonymous masking so you never feel hesitant in front of seniors.
              </p>
            </div>

            {/* Step 03: Soft Periwinkle */}
            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-2xl bg-[#EEF4FD] border border-[#D0E2FA] text-[#2563EB] font-serif font-extrabold text-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                03
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
                Peer & AI Review
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Peers and seniors provide intuitive explanations, while Gemini AI reviews correctness and flags edge cases.
              </p>
            </div>

            {/* Step 04: Soft Mint */}
            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-2xl bg-[#EEF8F1] border border-[#D0EFE0] text-[#059669] font-serif font-extrabold text-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                04
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
                Accept & Reward
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accept the best solution. Answerers earn +25 Reputation points, creating permanent reusable knowledge for everyone.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Pill CTA matching Image 1 */}
        <div className="mt-14 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-100/70 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm transition-all"
          >
            <span>Ready to start?</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
          </Link>
        </div>
      </section>

      {/* 3. THE PROBLEM WE SOLVE */}
      <section id="problem" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#1E1B18] text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          {/* Subtle cosmic glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-widest block mb-3">
              The Real Problem
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold leading-tight">
              Why do 50 students ask the same doubt in 50 private chats?
            </h2>
            <p className="mt-6 text-slate-300 text-sm sm:text-base leading-relaxed">
              Students often hesitate to ask basic doubts in classroom settings. They message classmates or seniors individually. The same concept gets explained 10 separate times, only to disappear into private DM history instead of building a permanent knowledge asset.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>PeerSolve solves this by making student knowledge public, verified, and rewarding.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY PLATFORM FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">
            Core Differentiators
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 mt-2">
            Built for Real Student Needs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white/80 backdrop-blur-sm p-7 rounded-3xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5 border border-amber-100">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
              Semantic Search (pgvector)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find solutions by concept, not just exact keywords. 768-dimensional embeddings match conceptually similar doubts instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/80 backdrop-blur-sm p-7 rounded-3xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5 border border-purple-100">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
              Safe Anonymous Asking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete privacy protection for shy students. Identities are scrubbed from public profiles and AI backend calls.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/80 backdrop-blur-sm p-7 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 border border-emerald-100">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-900 mb-2">
              Seniority & Reputation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Earn +25 Rep for accepted answers, unlock achievement badges, and showcase your academic mentor ranking to recruiters.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-20">
        <div className="bg-gradient-to-br from-amber-700 via-orange-700 to-amber-900 text-white rounded-3xl p-10 sm:p-14 shadow-2xl relative overflow-hidden">
          <SolarOrbits compact={true} className="opacity-40" />
          <div className="relative z-10">
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold max-w-xl mx-auto leading-tight">
              Ready to solve academic doubts together?
            </h2>
            <p className="mt-4 text-amber-100 text-sm sm:text-base max-w-md mx-auto">
              Join your university peers and start turning private chats into reusable knowledge today.
            </p>
            <div className="mt-8">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-900 hover:bg-amber-50 font-bold text-sm rounded-2xl shadow-lg hover:scale-105 transition-all"
              >
                <span>Create Free Student Account</span>
                <ArrowRight className="w-4 h-4 text-amber-700" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/50 backdrop-blur-sm py-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="md" showTagline={true} />

          <p className="text-xs text-slate-500 text-center sm:text-right">
            PeerSolve — Academic Doubt Solving Network. Built with Supabase & Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

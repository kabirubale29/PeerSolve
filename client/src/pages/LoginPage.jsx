import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, GraduationCap, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BrandLogo from '../components/common/BrandLogo';
import SolarOrbits from '../components/common/SolarOrbits';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, demoUsers, switchDemoUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your university email and password.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      showToast('Welcome back to PeerSolve!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] bg-dot-pattern flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left Side: Solar Orbits & Academic Mission Showcase (Image 2 style) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#FAF7F2] via-[#F5EFEB] to-[#EFE7DE] border-r border-amber-900/10 flex-col justify-between p-12 overflow-hidden">
        {/* Spinning Solar Orbits Background */}
        <SolarOrbits compact={false} />

        {/* Top: Logo */}
        <div className="relative z-10">
          <BrandLogo size="lg" showTagline={true} linkTo="/" />
        </div>

        {/* Middle: Editorial Serif Hero Statement */}
        <div className="relative z-10 max-w-md space-y-4 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Academic Peer Knowledge Exchange</span>
          </div>

          <h2 className="font-serif text-4xl font-extrabold text-slate-900 leading-[1.15]">
            Where university doubts become{' '}
            <span className="italic font-serif bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 bg-clip-text text-transparent">
              lasting knowledge.
            </span>
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            Connect across academic years, collaborate on complex coursework, and build your verified academic standing.
          </p>

          {/* Micro Benefit List */}
          <div className="pt-4 space-y-2.5">
            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-900/10 shadow-xs">
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">01</span>
              <span className="text-xs font-medium text-slate-700">Semantic doubt search across prior college batches</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-900/10 shadow-xs">
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">02</span>
              <span className="text-xs font-medium text-slate-700">Advisory AI verification & senior mentor answers</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-900/10 shadow-xs">
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">03</span>
              <span className="text-xs font-medium text-slate-700">Earn reputation badges recognized in your university</span>
            </div>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} PeerSolve • Academic Knowledge Network
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-amber-900/10 shadow-xl shadow-amber-900/5 max-w-md w-full p-8">
          {/* Mobile Logo Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-block mb-3">
              <BrandLogo size="md" showTagline={false} linkTo="/" />
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Welcome Back</span>
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to PeerSolve
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your university email and password to access the academic forum.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2]/60 rounded-xl border border-amber-900/15 text-sm text-slate-900 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2]/60 rounded-xl border border-amber-900/15 text-sm text-slate-900 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Fast-Login Selector for Hackathon Judging */}
          <div className="mt-8 pt-6 border-t border-amber-900/10">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-3">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>Instant Demo Sign-In (Judge Mode)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.slice(0, 2).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    switchDemoUser(u.id);
                    showToast(`Signed in as ${u.name} (${u.role.toUpperCase()})`, 'success');
                    navigate('/dashboard');
                  }}
                  className="p-2.5 bg-[#FAF7F2] hover:bg-amber-100/60 border border-amber-900/15 hover:border-amber-400 rounded-xl text-left transition-all text-xs cursor-pointer group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-amber-900">{u.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-amber-700 font-semibold">{u.role.toUpperCase()} • Year {u.year}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-amber-700 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

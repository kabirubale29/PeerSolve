import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RoleBadge from '../components/common/RoleBadge';

const DEGREE_OPTIONS = [
  'B.Tech / B.E. (Engineering)',
  'BCA (Computer Applications)',
  'MCA (Master of Computer Applications)',
  'M.Tech / M.E. (Postgraduate Engineering)',
  'B.Sc (Computer Science / IT)',
  'M.Sc (Computer Science / Data Science)',
  'Diploma in Engineering',
  'Ph.D / Doctorate Research',
  'Other Degree'
];

const BRANCH_OPTIONS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Artificial Intelligence & Data Science (AI/DS)',
  'Electronics & Telecommunication (ENTC)',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science & Analytics',
  'Other Stream'
];

const AVAILABLE_SUBJECTS = [
  'Java',
  'Python',
  'Data Structures',
  'Algorithms',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'Web Development',
  'Machine Learning / AI',
  'Mathematics'
];

export default function SignupPage() {
  const [step, setStep] = useState(1); // Step 1: Account basics, Step 2: Academic Profile

  // Step 1 Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 Fields
  const [degree, setDegree] = useState('B.Tech / B.E. (Engineering)');
  const [branch, setBranch] = useState('Computer Science & Engineering (CSE)');
  const [year, setYear] = useState(2);
  const [age, setAge] = useState(20);
  const [selectedSubjects, setSelectedSubjects] = useState(['Java', 'Data Structures']);

  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const toggleSubject = (sub) => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name.', 'warning');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid university email.', 'warning');
      return;
    }
    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const computedRole = Number(year) >= 3 ? 'senior' : 'junior';
    const profilePayload = {
      name: name.trim(),
      degree: degree,
      branch: branch,
      year: Number(year),
      age: Number(age),
      role: computedRole,
      subjects: selectedSubjects,
      bio: `${degree} (${branch}), Year ${year}`
    };

    try {
      const res = await signup(email, password, profilePayload);

      // If email confirmation is required on Supabase
      if (res && res.user && !res.session) {
        setEmailSent(true);
        showToast('Confirmation email sent! Please check your inbox.', 'info');
      } else {
        showToast(`Welcome to PeerSolve, ${name}!`, 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full p-6 sm:p-8">
        {emailSent ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-100">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Check Your Inbox</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We have sent a verification link to <span className="font-bold text-slate-900">{email}</span>.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 text-left space-y-2">
              <p className="font-semibold text-slate-700">Next steps:</p>
              <p>1. Open the confirmation email and click the verification link.</p>
              <p>2. Once verified, log in to immediately access your peer community.</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* Header / Brand */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
                  Peer<span className="text-emerald-600">Solve</span>
                </span>
              </Link>
              <h2 className="text-2xl font-extrabold text-slate-900">Create Student Account</h2>
              <p className="text-xs text-slate-500 mt-1">
                Join your university doubt solving network and build academic reputation.
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-100 text-emerald-800'
              }`}>
                <span>1. Account Info</span>
              </div>
              <span className="text-slate-300 font-bold">→</span>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 2 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
              }`}>
                <span>2. Degree & Seniority</span>
              </div>
            </div>

            {/* STEP 1: Account Info */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Harshal Ubale"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    University / Personal Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ubalekabir29@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-6"
                >
                  <span>Continue to Academic Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Academic Details & Seniority */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
                {/* Degree & Stream */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Degree Pursuing <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                    >
                      {DEGREE_OPTIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Branch / Stream <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                    >
                      {BRANCH_OPTIONS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Academic Year & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Academic Year <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                    >
                      <option value={1}>1st Year (Freshman / Junior)</option>
                      <option value={2}>2nd Year (Peer Guide — Senior to 1st Yr)</option>
                      <option value={3}>3rd Year (Senior Scholar)</option>
                      <option value={4}>4th Year (Final Year Senior Mentor)</option>
                      <option value={5}>5th+ Year (Postgraduate / Senior)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      min={16}
                      max={60}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                      placeholder="e.g. 20"
                      required
                    />
                  </div>
                </div>

                {/* Interactive Seniority Preview */}
                <div className="p-3.5 bg-gradient-to-r from-slate-50 to-emerald-50/40 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                      Assigned Community Standing:
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                      {year === 1 && '🌱 1st Year: Junior Peer (Ask doubts & learn)'}
                      {year === 2 && '⚡ 2nd Year: Peer Guide (Senior to 1st yrs, peers to 2nd yrs)'}
                      {year === 3 && '⭐ 3rd Year: Senior Scholar (Can mentor juniors & seniors)'}
                      {year >= 4 && '🎓 Final Year: Senior Mentor (Highest academic advisory authority)'}
                    </span>
                  </div>
                  <RoleBadge year={year} role={year >= 3 ? 'senior' : 'junior'} size="lg" />
                </div>

                {/* Subject Interests / Expertise */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Expertise / Interested Subjects
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                    {AVAILABLE_SUBJECTS.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSubject(sub)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={submitting}
                    className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{submitting ? 'Setting up Profile...' : 'Complete & Launch'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

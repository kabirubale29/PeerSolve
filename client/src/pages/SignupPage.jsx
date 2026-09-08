import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  GraduationCap,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RoleBadge from '../components/common/RoleBadge';
import BrandLogo from '../components/common/BrandLogo';
import SolarOrbits from '../components/common/SolarOrbits';

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
    <div className="min-h-screen bg-[#FAF7F2] bg-dot-pattern flex flex-col lg:flex-row relative overflow-hidden">
      {/* Left Side: Solar Orbits & Mission Showcase */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-[#FAF7F2] via-[#F5EFEB] to-[#EFE7DE] border-r border-amber-900/10 flex-col justify-between p-12 overflow-hidden">
        <SolarOrbits compact={false} />

        <div className="relative z-10">
          <BrandLogo size="lg" showTagline={true} linkTo="/" />
        </div>

        <div className="relative z-10 max-w-md space-y-4 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Join Your University Hub</span>
          </div>

          <h2 className="font-serif text-3xl font-extrabold text-slate-900 leading-tight">
            Build your reputation as an{' '}
            <span className="italic font-serif bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 bg-clip-text text-transparent">
              academic problem solver.
            </span>
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            Junior students get instant clarity from seniors and advisory AI. Seniors earn recognized badges, certificates, and reputation.
          </p>

          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-900/10 text-xs text-slate-700">
              <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">01</span>
              <span>Fast question matching across your branch & year</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-900/10 text-xs text-slate-700">
              <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">02</span>
              <span>Anonymous posting option to ask without fear</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} PeerSolve • Academic Knowledge Network
        </div>
      </div>

      {/* Right Side: Step-by-Step Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-amber-900/10 shadow-xl shadow-amber-900/5 max-w-xl w-full p-6 sm:p-8">
          {emailSent ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-200">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-extrabold text-slate-900">Check Your Inbox</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We have sent a verification link to <span className="font-bold text-slate-900">{email}</span>.
              </p>
              <div className="p-4 bg-[#FAF7F2] border border-amber-900/10 rounded-2xl text-xs text-slate-600 text-left space-y-2">
                <p className="font-bold text-slate-800">Next steps:</p>
                <p>1. Open the confirmation email and click the verification link.</p>
                <p>2. Once verified, log in to immediately access your peer community.</p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* Header / Brand on mobile */}
              <div className="lg:hidden text-center mb-6">
                <BrandLogo size="md" showTagline={false} linkTo="/" />
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Student Registration</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Create Student Account
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Join your college doubt solving forum and collaborate across batches.
                </p>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  step === 1 ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20' : 'bg-amber-100 text-amber-900'
                }`}>
                  <span>1. Account Info</span>
                </div>
                <span className="text-amber-300 font-bold">→</span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  step === 2 ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20' : 'bg-slate-100 text-slate-500'
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
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2]/60 rounded-xl border border-amber-900/15 text-sm text-slate-900 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
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
                        placeholder="e.g. student@college.edu"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2]/60 rounded-xl border border-amber-900/15 text-sm text-slate-900 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
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
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2]/60 rounded-xl border border-amber-900/15 text-sm text-slate-900 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
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
                        className="w-full px-3 py-2.5 bg-[#FAF7F2] rounded-xl border border-amber-900/15 text-xs font-semibold text-slate-800 outline-none focus:border-amber-600"
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
                        className="w-full px-3 py-2.5 bg-[#FAF7F2] rounded-xl border border-amber-900/15 text-xs font-semibold text-slate-800 outline-none focus:border-amber-600"
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
                        className="w-full px-3 py-2.5 bg-[#FAF7F2] rounded-xl border border-amber-900/15 text-xs font-semibold text-slate-800 outline-none focus:border-amber-600"
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
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl border border-amber-900/15 text-xs font-semibold text-slate-800 outline-none focus:border-amber-600"
                        placeholder="e.g. 20"
                        required
                      />
                    </div>
                  </div>

                  {/* Interactive Seniority Preview */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 block uppercase tracking-wider">
                        Assigned Community Standing:
                      </span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                        {year === 1 && '🌱 1st Year: Junior Peer (Ask doubts & learn)'}
                        {year === 2 && '⚡ 2nd Year: Peer Guide (Senior to 1st yrs, peers to 2nd yrs)'}
                        {year === 3 && '⭐ 3rd Year: Senior Scholar (Can mentor juniors & seniors)'}
                        {year >= 4 && '🎓 Final Year: Senior Mentor (Highest academic authority)'}
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
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-[#FAF7F2] text-slate-700 border border-amber-900/10 hover:border-amber-300'
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
                      className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-2/3 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>{submitting ? 'Setting up Profile...' : 'Complete & Launch'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center text-xs text-slate-500 border-t border-amber-900/10 pt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-amber-700 font-bold hover:underline">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

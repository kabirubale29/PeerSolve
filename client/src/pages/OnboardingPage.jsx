import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RoleBadge from '../components/common/RoleBadge';

const AVAILABLE_SUBJECTS = [
  'Java',
  'Python',
  'Data Structures',
  'Algorithms',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'Mathematics',
  'Electronics'
];

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

export default function OnboardingPage() {
  const { profile, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || '');
  const [degree, setDegree] = useState(profile?.degree || 'B.Tech / B.E. (Engineering)');
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science & Engineering (CSE)');
  const [year, setYear] = useState(profile?.year || 2);
  const [age, setAge] = useState(profile?.age || 20);
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedSubjects, setSelectedSubjects] = useState(profile?.subjects || ['Java', 'Data Structures']);
  const [saving, setSaving] = useState(false);

  // Configurable threshold: Year 3+ is Senior
  const computedRole = Number(year) >= 3 ? 'senior' : 'junior';

  const toggleSubject = (sub) => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your name.', 'warning');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        year: Number(year),
        age: Number(age),
        role: computedRole,
        bio: bio.trim(),
        subjects: selectedSubjects
      });

      showToast('Academic profile setup complete!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Unable to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Set Up Academic Profile</h2>
          <p className="text-sm text-slate-500 mt-1">
            Help your university community recognize your degree, coursework, and seniority.
          </p>
        </div>

        <form onSubmit={handleComplete} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Harshal Ubale"
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:border-emerald-500 outline-none"
              required
            />
          </div>

          {/* Degree & Branch */}
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
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Computer Science & Eng"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:bg-white focus:border-emerald-500 outline-none"
                required
              />
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
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
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
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Role Preview Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Assigned Community Standing:</span>
              <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">
                {year === 1 && '🌱 1st Year: Junior Peer'}
                {year === 2 && '⚡ 2nd Year: Peer Guide'}
                {year === 3 && '⭐ 3rd Year: Senior Scholar'}
                {year >= 4 && '🎓 Final Year: Senior Mentor'}
              </span>
            </div>
            <RoleBadge year={year} role={computedRole} size="lg" />
          </div>

          {/* Subject Interests */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Subjects of Interest & Coursework
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SUBJECTS.map(sub => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Short Bio (Optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. 2nd year CS student eager to master algorithms and OOP..."
              rows={2}
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{saving ? 'Saving Profile...' : 'Complete & Open Forum'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

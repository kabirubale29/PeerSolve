import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  Sparkles,
  Shield,
  Send,
  ArrowLeft,
  BookOpen,
  Tag,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SimilarQuestionsPanel from '../components/questions/SimilarQuestionsPanel';
import AIImproveButton from '../components/ai/AIImproveButton';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SUBJECTS = [
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

export default function AskQuestionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Form Fields (can be pre-filled via search params from AI Assistant!)
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [description, setDescription] = useState(searchParams.get('description') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || 'Java');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(
    searchParams.get('tags') ? searchParams.get('tags').split(',') : ['Foundations']
  );
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Similar Question Detection State
  const [similarMatches, setSimilarMatches] = useState([]);
  const [checkingSimilar, setCheckingSimilar] = useState(false);
  const [dismissedSimilar, setDismissedSimilar] = useState(false);
  const [selectedSoftLinks, setSelectedSoftLinks] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const debounceTimerRef = useRef(null);

  // Debounced 500ms Semantic Similarity Check (triggers after 15+ characters)
  useEffect(() => {
    if (dismissedSimilar) return;

    if (title.trim().length >= 15) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setCheckingSimilar(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const res = await api.getSimilarQuestions(title.trim());
          setSimilarMatches(res.matches || []);
        } catch (err) {
          console.warn('Similar question check error:', err);
        } finally {
          setCheckingSimilar(false);
        }
      }, 500);
    } else {
      setSimilarMatches([]);
      setCheckingSimilar(false);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [title, dismissedSimilar]);

  // Tag Management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Toggle Soft-link
  const handleToggleSoftLink = (qId) => {
    setSelectedSoftLinks(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  // Submit Question (Non-blocking!)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please log in or select a demo user to post a question.', 'warning');
      return;
    }

    if (!title.trim() || title.trim().length < 5) {
      showToast('Question title must be at least 5 characters.', 'warning');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      showToast('Please provide a detailed description of your doubt.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        subject,
        topic: topic.trim(),
        tags,
        is_anonymous: isAnonymous,
        related_question_ids: selectedSoftLinks
      };

      const res = await api.createQuestion(payload);
      showToast('Doubt posted to community forum!', 'success');
      navigate(`/question/${res.question.id}`);
    } catch (err) {
      showToast(err.message || 'Unable to post your question. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doubts Feed</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Ask an Academic Doubt
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Your question will be visible to university peers and seniors.
              </p>
            </div>

            {/* AI Improve Button */}
            <AIImproveButton
              title={title}
              description={description}
              subject={subject}
              tags={tags}
              onApplyChanges={(improved) => {
                setTitle(improved.title);
                setDescription(improved.description);
                if (improved.subject) setSubject(improved.subject);
                if (improved.tags) setTags(improved.tags);
              }}
            />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Question Title *
                </label>
                <span className="text-[11px] text-slate-400">
                  Be specific, e.g. "What is polymorphism in Java?"
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDismissedSimilar(false);
                }}
                placeholder="What is the concept, theorem, or bug you are trying to understand?"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                required
              />
            </div>

            {/* Debounced Similar Questions Panel (Non-blocking!) */}
            {!dismissedSimilar && (
              <SimilarQuestionsPanel
                matches={similarMatches}
                isLoading={checkingSimilar}
                onDismiss={() => setDismissedSimilar(true)}
                onSelectSoftLink={handleToggleSoftLink}
                selectedSoftLinks={selectedSoftLinks}
              />
            )}

            {/* Subject & Topic Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
                >
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Topic / Sub-area (Optional)
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Dynamic Method Dispatch, Trees, Paging"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detailed Doubt Description *
                </label>
                <span className="text-[11px] text-slate-400">
                  Include what you already tried or where you got stuck
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what concept is confusing, share any code snippets, textbook references, or assumptions you have..."
                rows={7}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-y font-sans leading-relaxed"
                required
              />
            </div>

            {/* Custom Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tags (Press Enter or comma to add)
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-emerald-500">
                {tags.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-emerald-700 hover:text-emerald-900 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "e.g. OOP, Java, Complexity" : "Add more tags..."}
                  className="bg-transparent border-0 text-sm outline-none px-2 py-1 flex-1 min-w-[120px]"
                />
              </div>
            </div>

            {/* Anonymous Toggle & Post Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Ask anonymously (Your name stays hidden publicly; reputation still accrues)
                </span>
              </label>

              {/* Submit Button (Never disabled by similar questions panel!) */}
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Publishing Doubt...' : 'Post Question'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

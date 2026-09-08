import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Sparkles,
  Layers,
  HelpCircle,
  Filter,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import QuestionCard from '../components/questions/QuestionCard';
import QuestionFilterTabs from '../components/questions/QuestionFilterTabs';
import EmptyState from '../components/common/EmptyState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialSubject = searchParams.get('subject') || 'All';
  const initialTag = searchParams.get('tag') || null;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'open' | 'solved'

  const { profile } = useAuth();

  // Fetch questions from backend
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        tab: activeTab,
        subject: selectedSubject !== 'All' ? selectedSubject : '',
        tag: selectedTag || '',
        search: searchQuery || '',
        status: statusFilter || ''
      };

      const res = await api.getQuestions(params);
      setQuestions(res.questions || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedSubject, selectedTag, searchQuery, statusFilter]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Sync URL params when search or subject changes
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (val) {
      setSearchParams({ search: val });
    } else {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  const handleSelectSubject = (subj) => {
    setSelectedSubject(subj);
    if (subj !== 'All') {
      searchParams.set('subject', subj);
    } else {
      searchParams.delete('subject');
    }
    setSearchParams(searchParams);
  };

  const handleSelectTag = (tag) => {
    setSelectedTag(tag);
    if (tag) {
      searchParams.set('tag', tag);
    } else {
      searchParams.delete('tag');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Search Hero Banner */}
        <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md mb-8 relative overflow-hidden border border-amber-900/20">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Search Before You Ask
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">
              Got an academic doubt?
            </h1>
            <p className="mt-2 text-amber-100 text-sm leading-relaxed font-sans">
              Chances are another student already asked it. Search our peer knowledge base to find verified answers immediately.
            </p>

            {/* Prominent Search Bar */}
            <div className="mt-5 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search doubts by title, concept, or code (e.g. polymorphism, O(log n), 3NF)..."
                className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 placeholder-slate-400 rounded-2xl shadow-md border-0 outline-none text-sm font-medium focus:ring-4 focus:ring-amber-500/20"
              />
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Main Feed & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Feed Tabs & Status Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <QuestionFilterTabs
                activeTab={activeTab}
                onSelectTab={setActiveTab}
              />

              {/* Status and Active Filter Chips */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Status:</span>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      statusFilter === '' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('solved')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      statusFilter === 'solved' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    ✓ Solved
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('open')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      statusFilter === 'open' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Open
                  </button>
                </div>

                {/* Active Subject or Tag Indicator */}
                {(selectedSubject !== 'All' || selectedTag || searchQuery) && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Filtering by:</span>
                    {selectedSubject !== 'All' && (
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                        {selectedSubject}
                      </span>
                    )}
                    {selectedTag && (
                      <span className="bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                        #{selectedTag}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubject('All');
                        setSelectedTag(null);
                        setSearchQuery('');
                        searchParams.delete('subject');
                        searchParams.delete('tag');
                        searchParams.delete('search');
                        setSearchParams(searchParams);
                      }}
                      className="text-rose-600 hover:underline font-bold"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Questions List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : questions.length === 0 ? (
              <EmptyState
                title="No doubts match your search"
                description={
                  activeTab === 'unanswered'
                    ? "Great job! All doubts have currently been answered by peers and senior mentors."
                    : "Couldn't find any existing questions matching your criteria. Be the first to ask!"
                }
                actionText="Ask This Question"
                onAction={() => window.location.href = `/ask?title=${encodeURIComponent(searchQuery)}`}
              />
            ) : (
              <div className="space-y-4">
                {questions.map(q => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onVoteChange={loadQuestions}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4">
            <Sidebar
              selectedSubject={selectedSubject}
              onSelectSubject={handleSelectSubject}
              selectedTag={selectedTag}
              onSelectTag={handleSelectTag}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

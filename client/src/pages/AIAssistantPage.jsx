import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookOpen,
  Bot,
  User,
  HelpCircle
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${profile?.name?.split(' ')[0] || 'there'}! I'm PeerSolve's Academic AI Assistant. 

Ask me any academic doubt in Computer Science, Math, or Engineering (e.g. "Explain the difference between process and thread" or "How does quicksort partition work?"). 

If we formulate a helpful answer, you can publish it directly to the community forum as reusable knowledge with 1 click!`,
      suggestedQuestion: null,
      feedbackGiven: false
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery.trim();
    setInputQuery('');

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.assistantChat({
        messages: messages.slice(-4).map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
        userQuery: userText
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply || 'Here is the explanation for your academic doubt.',
        suggestedQuestion: res.suggestedQuestion || {
          title: userText.slice(0, 80),
          description: userText,
          subject: 'Other',
          tags: ['General']
        },
        feedbackGiven: false
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      showToast('AI service response error. Please try again.', 'error');
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'The AI assistant is temporarily unavailable. You can always ask your question directly on the community forum!',
          suggestedQuestion: {
            title: userText.slice(0, 80),
            description: userText,
            subject: 'Other',
            tags: ['General']
          },
          feedbackGiven: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Flow: Post to Forum with pre-filled question data
  const handlePostToForum = (suggested) => {
    if (!suggested) return;
    const queryParams = new URLSearchParams({
      title: suggested.title || '',
      description: suggested.description || '',
      subject: suggested.subject || 'Other',
      tags: (suggested.tags || []).join(',')
    }).toString();

    navigate(`/ask?${queryParams}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Academic AI Assistant</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore doubts interactively, then turn your solution into community knowledge.
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI → Community Knowledge Workflow</span>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between overflow-hidden min-h-[500px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';

              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-xs ${
                      isAi ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] space-y-3`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                        isAi
                          ? 'bg-slate-50 border border-slate-200 text-slate-900'
                          : 'bg-emerald-600 text-white font-medium'
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* Interactive Post-Doubt Workflow (Section 22 & 23) */}
                    {isAi && m.suggestedQuestion && (
                      <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3 animate-fade-in">
                        {/* 1. "Did this solve your doubt?" prompt */}
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <span className="font-bold text-indigo-950 flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                            Did this solve your academic doubt?
                          </span>

                          {!m.feedbackGiven ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  m.feedbackGiven = true;
                                  showToast("Glad this was helpful! Consider sharing it with peers.", "success");
                                  setMessages([...messages]);
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-xs flex items-center gap-1"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>Yes, I'm satisfied</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  m.feedbackGiven = true;
                                  showToast("Feel free to ask a follow-up or post to the forum for peer help.", "info");
                                  setMessages([...messages]);
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg font-semibold text-xs flex items-center gap-1"
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span>Need more help</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-bold">✓ Feedback recorded</span>
                          )}
                        </div>

                        {/* 2. "Share this with the student community? -> [Post to Forum]" */}
                        <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-xs font-bold text-indigo-900 block">
                              Share this knowledge with your peers?
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Turns this doubt into reusable community notes. Pre-fills title, description, and tags!
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePostToForum(m.suggestedQuestion)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Post to Forum</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl w-fit animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Thinking through academic concept...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask an academic doubt (e.g. 'Explain binary search complexity step by step')..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-sm transition-all disabled:opacity-50"
              title="Send doubt"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

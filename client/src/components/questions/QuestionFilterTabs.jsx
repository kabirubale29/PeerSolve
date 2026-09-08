import React from 'react';
import { Clock, Flame, HelpCircle, Sparkles } from 'lucide-react';

export default function QuestionFilterTabs({ activeTab = 'recent', onSelectTab }) {
  const tabs = [
    { id: 'recent', label: 'Recent Doubts', icon: <Clock className="w-4 h-4" /> },
    { id: 'popular', label: 'Most Upvoted', icon: <Flame className="w-4 h-4" /> },
    { id: 'unanswered', label: 'Unanswered', icon: <HelpCircle className="w-4 h-4" />, highlight: true },
    { id: 'recommended', label: 'Recommended For You', icon: <Sparkles className="w-4 h-4" /> }
  ];

  return (
    <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

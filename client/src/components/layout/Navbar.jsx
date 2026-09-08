import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Sparkles,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import RoleBadge from '../common/RoleBadge';
import ReputationBadge from '../common/ReputationBadge';

export default function Navbar() {
  const { profile, isAuthenticated, logout, demoUsers, switchDemoUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoSwitcherOpen, setDemoSwitcherOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Poll or fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then(res => setUnreadNotifs(res.unread_count || 0))
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  // Handle global search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
        setDemoSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">
              Peer<span className="text-emerald-600">Solve</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Academic Doubt Forum
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doubts (e.g., polymorphism, binary search, DBMS 3NF)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-transparent focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            />
          </form>
        </div>

        {/* Navigation CTAs */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              {/* Ask Question CTA */}
              <Link
                to="/ask"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ask Question</span>
              </Link>

              {/* AI Assistant CTA */}
              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-sm font-semibold rounded-xl transition-colors"
                title="Open PeerSolve Academic AI Assistant"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="hidden lg:inline">AI Assistant</span>
              </Link>

              {/* Notifications Link */}
              <Link
                to="/notifications"
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50"
                >
                  <img
                    src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={profile?.name || 'Profile'}
                    className="w-7 h-7 rounded-lg bg-slate-200 object-cover"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {profile?.name ? profile.name.split(' ')[0] : 'User'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold leading-tight">
                      {profile?.reputation || 0} Rep
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{profile?.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Year {profile?.year || 1} • {profile?.branch || 'CS'}</p>
                      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        <RoleBadge role={profile?.role} />
                        <ReputationBadge reputation={profile?.reputation || 0} />
                      </div>
                    </div>

                    <Link
                      to="/landing"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>About / Landing Page</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Badges</span>
                    </Link>

                    {/* Hackathon Demo User Switcher Button */}
                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => setDemoSwitcherOpen(!demoSwitcherOpen)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-emerald-700"
                      >
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-purple-600" />
                          Switch Role (Demo Flow)
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${demoSwitcherOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {demoSwitcherOpen && (
                        <div className="mt-2 space-y-1">
                          {demoUsers.map(u => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                switchDemoUser(u.id);
                                setProfileOpen(false);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                                profile?.id === u.id
                                  ? 'bg-emerald-100 text-emerald-900 font-bold'
                                  : 'hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              <span>{u.name} ({u.role.toUpperCase()})</span>
                              <span className="text-[10px] text-slate-500">{u.reputation} Rep</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/landing"
                className="hidden sm:inline-block px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                About PeerSolve
              </Link>
              <Link
                to="/login"
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

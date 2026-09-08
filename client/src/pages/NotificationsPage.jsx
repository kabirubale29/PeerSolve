import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCheck
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EmptyState from '../components/common/EmptyState';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      showToast('Unable to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      showToast('Unable to update notification.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast('Unable to update notifications.', 'error');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'accepted':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'upvote':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'reported':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'comment':
      case 'answer':
      default:
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Notifications</h1>
                <p className="text-xs text-slate-500">
                  Updates on your questions, answers, upvotes, and reputation.
                </p>
              </div>
            </div>

            {notifications.some(n => !n.is_read) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              description="When peers answer your doubts, upvote your answers, or comment, notifications will appear here."
            />
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    !n.is_read
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1">
                      <p className={`text-sm leading-relaxed ${!n.is_read ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                        {n.message}
                      </p>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {n.link_url && (
                      <Link
                        to={n.link_url}
                        onClick={() => handleMarkRead(n.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="text-xs font-semibold text-emerald-700 hover:underline px-2 py-1"
                        title="Mark as read"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

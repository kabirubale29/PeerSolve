import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState([]);

  // Fetch current user profile
  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.getMyProfile();
      if (data && data.profile) {
        setProfile(data.profile);
        setUser(data.profile);
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
    }
  }, []);

  // Initialize Auth state
  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      try {
        // Load demo users for switching
        const demoData = await api.getDemoUsers().catch(() => ({ users: [] }));
        setDemoUsers(demoData.users || []);

        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            localStorage.setItem('peersolve_auth_token', session.access_token);
            await fetchProfile();
          } else {
            const savedDemoId = localStorage.getItem('peersolve_demo_user_id');
            if (savedDemoId) {
              await fetchProfile();
            } else {
              setUser(null);
              setProfile(null);
            }
          }

          // Listen to auth state changes from Supabase
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
              localStorage.setItem('peersolve_auth_token', session.access_token);
              await fetchProfile();
            } else if (event === 'SIGNED_OUT') {
              localStorage.removeItem('peersolve_auth_token');
              localStorage.removeItem('peersolve_demo_user_id');
              setUser(null);
              setProfile(null);
            }
          });

          return () => {
            subscription?.unsubscribe();
          };
        } else {
          // Local/Demo Mode: Only authenticate if user explicitly signed in
          const savedDemoId = localStorage.getItem('peersolve_demo_user_id');
          const isExplicitlyLoggedIn = localStorage.getItem('peersolve_is_authenticated') === 'true';

          if (savedDemoId && isExplicitlyLoggedIn) {
            await fetchProfile();
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, [fetchProfile]);

  // Demo user switcher (Very useful for hackathon judging!)
  const switchDemoUser = async (userId) => {
    setLoading(true);
    try {
      localStorage.removeItem('peersolve_auth_token');
      localStorage.setItem('peersolve_demo_user_id', userId);
      localStorage.setItem('peersolve_is_authenticated', 'true');
      await fetchProfile();
    } catch (err) {
      console.error('Switch user error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Supabase or demo
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        localStorage.setItem('peersolve_auth_token', data.session.access_token);
        localStorage.setItem('peersolve_is_authenticated', 'true');
        await fetchProfile();
        return data;
      } else {
        // Mock login
        localStorage.setItem('peersolve_demo_user_id', 'a1111111-1111-1111-1111-111111111111');
        localStorage.setItem('peersolve_is_authenticated', 'true');
        await fetchProfile();
        return { user: { email } };
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign up with Supabase or demo
  const signup = async (email, password, metadata = {}) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata }
        });
        if (error) throw error;
        if (data.session) {
          localStorage.setItem('peersolve_auth_token', data.session.access_token);
        }
        localStorage.setItem('peersolve_is_authenticated', 'true');
        
        // Immediately sync complete metadata to profile
        try {
          await api.updateMyProfile(metadata);
        } catch (syncErr) {
          console.warn('Initial profile sync note:', syncErr.message);
        }

        await fetchProfile();
        return data;
      } else {
        // Mock signup
        localStorage.setItem('peersolve_demo_user_id', 'a1111111-1111-1111-1111-111111111111');
        localStorage.setItem('peersolve_is_authenticated', 'true');
        await api.updateMyProfile(metadata);
        await fetchProfile();
        return { user: { email } };
      }
    } finally {
      setLoading(false);
    }
  };

  // Log out
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('peersolve_auth_token');
    localStorage.removeItem('peersolve_demo_user_id');
    localStorage.removeItem('peersolve_is_authenticated');
    setUser(null);
    setProfile(null);
  };

  // Update profile
  const updateProfile = async (payload) => {
    const data = await api.updateMyProfile(payload);
    if (data && data.profile) {
      setProfile(data.profile);
      setUser(data.profile);
    }
    return data;
  };

  const value = {
    user,
    profile,
    loading,
    demoUsers,
    switchDemoUser,
    login,
    signup,
    logout,
    updateProfile,
    refreshProfile: fetchProfile,
    isAuthenticated: !!profile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

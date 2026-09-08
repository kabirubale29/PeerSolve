import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { store } from '../services/mockData.js';
import { SENIOR_YEAR_THRESHOLD } from '../config/constants.js';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const router = Router();

/**
 * Helper to compute user stats & badges
 */
function getUserProfileWithStats(user, isSelf = false) {
  if (!user) return null;

  // Questions asked by user:
  // If viewing own profile, can see own anonymous questions. If public, EXCLUDE anonymous questions!
  const questions = store.questions.filter(q => q.user_id === user.id && (isSelf || !q.is_anonymous));
  const answers = store.answers.filter(a => a.user_id === user.id && (isSelf || !a.is_anonymous));
  
  const acceptedAnswersCount = store.answers.filter(a => a.user_id === user.id && a.is_accepted).length;
  
  // Total upvotes received on questions and answers
  const questionUpvotes = store.questions
    .filter(q => q.user_id === user.id)
    .reduce((sum, q) => sum + (q.upvote_count || 0), 0);
  const answerUpvotes = store.answers
    .filter(a => a.user_id === user.id)
    .reduce((sum, a) => sum + (a.upvote_count || 0), 0);
  const totalUpvotes = questionUpvotes + answerUpvotes;

  // User badges
  const userBadges = store.user_badges
    .filter(ub => ub.user_id === user.id)
    .map(ub => store.badges.find(b => b.slug === ub.badge_slug))
    .filter(Boolean);

  return {
    id: user.id,
    name: user.name,
    degree: user.degree || 'B.Tech',
    year: user.year || 1,
    branch: user.branch || 'Computer Science',
    age: user.age || 20,
    role: user.role || (user.year >= SENIOR_YEAR_THRESHOLD ? 'senior' : 'junior'),
    reputation: user.reputation || 0,
    avatar_url: user.avatar_url,
    bio: user.bio || '',
    subjects: user.subjects || [],
    stats: {
      questions_count: questions.length,
      answers_count: answers.length,
      accepted_answers_count: acceptedAnswersCount,
      total_upvotes: totalUpvotes
    },
    badges: userBadges,
    recent_questions: questions.slice(0, 5).map(q => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      status: q.status,
      upvote_count: q.upvote_count,
      created_at: q.created_at,
      is_anonymous: q.is_anonymous
    })),
    recent_answers: answers.slice(0, 5).map(a => {
      const q = store.questions.find(quest => quest.id === a.question_id);
      return {
        id: a.id,
        question_id: a.question_id,
        question_title: q?.title || 'Question',
        content_preview: a.content.slice(0, 100) + '...',
        is_accepted: a.is_accepted,
        ai_status: a.ai_status,
        upvote_count: a.upvote_count,
        created_at: a.created_at
      };
    })
  };
}

/**
 * GET /api/users/me
 * Profile of the authenticated user
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const meta = req.user.user_metadata || {};
    let user = store.users.find(u => u.id === userId);

    // If Supabase is configured, attempt to load profile from database
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (dbProfile) {
          if (!user) {
            user = { ...dbProfile };
            store.users.push(user);
          } else {
            Object.assign(user, dbProfile);
          }
        }
      } catch (dbErr) {
        console.warn('Supabase DB fetch profile note:', dbErr.message);
      }
    }

    if (!user) {
      // Auto-create profile from auth metadata / defaults
      const rawName = meta.name || meta.full_name || (req.user.email ? req.user.email.split('@')[0] : 'Student');
      const year = meta.year ? Number(meta.year) : 1;
      user = {
        id: userId,
        name: rawName,
        degree: meta.degree || 'B.Tech',
        year: year,
        branch: meta.branch || 'Computer Science',
        age: meta.age ? Number(meta.age) : 20,
        role: year >= SENIOR_YEAR_THRESHOLD ? 'senior' : 'junior',
        reputation: 0,
        avatar_url: meta.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        bio: meta.bio || '',
        subjects: meta.subjects || ['Java', 'Data Structures']
      };
      store.users.push(user);
    } else {
      // If user exists but name was generic, update from meta
      if (meta.name && (user.name === 'New Student' || user.name === 'User')) {
        user.name = meta.name;
      }
      if (meta.degree && !user.degree) user.degree = meta.degree;
      if (meta.branch && !user.branch) user.branch = meta.branch;
      if (meta.age && !user.age) user.age = Number(meta.age);
    }

    const profile = getUserProfileWithStats(user, true);
    res.json({ profile });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ error: 'Unable to load profile.' });
  }
});

/**
 * GET /api/users/:id
 * Public profile (strictly masks anonymous questions and answers)
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user ? req.user.id : null;
    const isSelf = requestingUserId === id;

    let user = store.users.find(u => u.id === id);
    if (!user && isSupabaseConfigured && supabase) {
      const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (dbProfile) {
        user = { ...dbProfile };
        store.users.push(user);
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const profile = getUserProfileWithStats(user, isSelf);
    res.json({ profile });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ error: 'Unable to load user profile.' });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile & onboarding info
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, year, branch, degree, age, bio, subjects } = req.body;

    let user = store.users.find(u => u.id === userId);
    if (!user) {
      user = {
        id: userId,
        reputation: 0,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
      };
      store.users.push(user);
    }

    if (name) user.name = name.trim();
    if (degree) user.degree = degree.trim();
    if (year !== undefined) {
      user.year = Number(year);
      // Auto-assign role based on configurable threshold (Year 3+ is Senior)
      user.role = user.year >= SENIOR_YEAR_THRESHOLD ? 'senior' : 'junior';
    }
    if (branch) user.branch = branch.trim();
    if (age !== undefined) user.age = Number(age);
    if (bio !== undefined) user.bio = bio.trim();
    if (Array.isArray(subjects)) user.subjects = subjects;

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          name: user.name,
          year: user.year,
          branch: user.branch,
          role: user.role,
          bio: user.bio,
          subjects: user.subjects
        });
      } catch (dbErr) {
        console.warn('Supabase DB profile upsert note:', dbErr.message);
      }
    }

    res.json({
      message: 'Profile updated successfully!',
      profile: getUserProfileWithStats(user, true)
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Unable to update profile.' });
  }
});

/**
 * GET /api/users/all-demo-users
 * Convenient helper for hackathon demo switching between Junior and Senior
 */
router.get('/all/demo-users', (req, res) => {
  res.json({
    users: store.users.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      year: u.year,
      branch: u.branch,
      reputation: u.reputation
    }))
  });
});

export default router;

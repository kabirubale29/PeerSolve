import { supabase, isSupabaseConfigured } from '../services/supabase.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check for demo user header
    const demoUserId = req.headers['x-demo-user-id'];
    if (demoUserId) {
      req.user = { id: demoUserId, role: req.headers['x-demo-user-role'] || 'junior' };
      return next();
    }
    return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];

  if (isSupabaseConfigured) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired authentication token.' });
      }
      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Failed to authenticate user.' });
    }
  } else {
    // Mock / Demo user mode
    req.user = {
      id: token.startsWith('mock-') ? token.replace('mock-', '') : 'a1111111-1111-1111-1111-111111111111',
      email: 'student@university.edu'
    };
    return next();
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const demoUserId = req.headers['x-demo-user-id'];

  if (demoUserId) {
    req.user = { id: demoUserId, role: req.headers['x-demo-user-role'] || 'junior' };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (isSupabaseConfigured) {
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      req.user = user || null;
    } catch {
      req.user = null;
    }
  } else {
    req.user = {
      id: token.startsWith('mock-') ? token.replace('mock-', '') : 'a1111111-1111-1111-1111-111111111111'
    };
  }
  next();
}

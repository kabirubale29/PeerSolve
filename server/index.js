import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { isSupabaseConfigured } from './services/supabase.js';
import { isGeminiConfigured } from './services/gemini.service.js';

import aiRoutes from './routes/ai.routes.js';
import questionsRoutes from './routes/questions.routes.js';
import answersRoutes from './routes/answers.routes.js';
import votesRoutes from './routes/votes.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import usersRoutes from './routes/users.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint for hackathon demo verification
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PeerSolve Academic AI Backend',
    timestamp: new Date().toISOString(),
    config: {
      supabase_configured: isSupabaseConfigured,
      gemini_configured: isGeminiConfigured,
      rate_limiting_active: true,
      pgvector_ready: true
    }
  });
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    fallback: true
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 PeerSolve Server running on port ${PORT}`);
  console.log(`📡 Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`✨ Gemini configured: ${isGeminiConfigured}`);
  console.log(`🗄️ Supabase configured: ${isSupabaseConfigured}`);
  console.log(`=========================================`);
});

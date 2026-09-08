import rateLimit from 'express-rate-limit';
import { AI_CONFIG } from '../config/constants.js';

export const aiRateLimiter = rateLimit({
  windowMs: AI_CONFIG.RATE_LIMIT_WINDOW_MS,
  max: AI_CONFIG.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI service rate limit exceeded. Please wait a moment before trying again.',
    fallback: true
  }
});

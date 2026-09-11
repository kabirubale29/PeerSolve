import { Router } from 'express';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  generateEmbedding,
  verifyAnswer,
  improveQuestion,
  assistantChat,
  isGeminiConfigured
} from '../services/gemini.service.js';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { store, cosineSimilarity } from '../services/mockData.js';

const router = Router();

/**
 * POST /api/ai/similar-questions
 * Semantic similarity search against existing questions (Advisory, Non-blocking)
 */
router.post('/similar-questions', optionalAuth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 10) {
      return res.json({ matches: [] });
    }

    const trimmedQuery = query.trim();

    // 1. If Supabase is configured with pgvector
    if (isSupabaseConfigured && isGeminiConfigured) {
      const embedding = await generateEmbedding(trimmedQuery);
      const { data, error } = await supabase.rpc('match_questions', {
        query_embedding: embedding,
        match_threshold: 0.50,
        match_count: 5
      });

      if (!error && data && data.length > 0) {
        return res.json({
          matches: data.map(q => ({
            id: q.id,
            title: q.title,
            description: q.description,
            subject: q.subject,
            status: q.status,
            similarity: q.similarity
          }))
        });
      }
    }

    // 2. Fallback in-memory matching (Word overlap + deterministic semantic matching)
    const queryTokens = trimmedQuery.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    const matches = store.questions
      .map(q => {
        const titleTokens = q.title.toLowerCase().split(/\W+/).filter(t => t.length > 2);
        const descTokens = q.description.toLowerCase().split(/\W+/).filter(t => t.length > 2);
        const allTokens = new Set([...titleTokens, ...descTokens]);

        let overlap = 0;
        for (const token of queryTokens) {
          if (allTokens.has(token)) overlap += 1;
        }

        const tokenScore = queryTokens.length > 0 ? (overlap / queryTokens.length) : 0;
        const normalizedScore = Math.min(0.99, tokenScore * 1.2);

        return {
          id: q.id,
          title: q.title,
          description: q.description,
          subject: q.subject,
          status: q.status,
          similarity: parseFloat(normalizedScore.toFixed(2))
        };
      })
      .filter(q => q.similarity >= 0.25)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return res.json({ matches });
  } catch (err) {
    console.error('Similar questions search error:', err);
    return res.json({ matches: [] });
  }
});

/**
 * POST /api/ai/verify-answer
 * Evaluates student answer for factual correctness and consistency
 */
router.post('/verify-answer', aiRateLimiter, optionalAuth, async (req, res) => {
  try {
    const { questionTitle, questionDescription, answerContent } = req.body;

    if (!answerContent || !answerContent.trim()) {
      return res.status(400).json({ error: 'Answer content is required.' });
    }

    const result = await verifyAnswer(
      questionTitle || '',
      questionDescription || '',
      answerContent.trim()
    );

    return res.json(result);
  } catch (err) {
    console.error('AI verification error:', err);
    return res.json({
      status: 'unavailable',
      feedback: 'AI review is temporarily unavailable. Your answer has still been saved.'
    });
  }
});

/**
 * POST /api/ai/improve-question
 * Suggests polished title, description, subject, and tags
 */
router.post('/improve-question', aiRateLimiter, optionalAuth, async (req, res) => {
  try {
    const { title, description, subject, tags } = req.body;

    if (!title || title.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide at least a brief question title.' });
    }

    const result = await improveQuestion(title, description || '', subject, tags);
    return res.json(result);
  } catch (err) {
    console.error('AI question improvement error:', err);
    return res.json({
      success: false,
      message: 'Unable to improve question at this time. You can still post as is.'
    });
  }
});

/**
 * POST /api/ai/assistant-chat
 * Academic AI doubt solving with "Post to Forum" extraction
 */
router.post('/assistant-chat', aiRateLimiter, optionalAuth, async (req, res) => {
  try {
    const { messages, userQuery } = req.body;

    if (!userQuery || !userQuery.trim()) {
      return res.status(400).json({ error: 'Query cannot be empty.' });
    }

    const result = await assistantChat(messages || [], userQuery.trim());
    return res.json(result);
  } catch (err) {
    console.error('Assistant chat error:', err);
    return res.json({
      reply: 'The AI assistant is temporarily unavailable. Please ask your question in the peer forum!',
      suggestedQuestion: {
        title: userQuery ? userQuery.slice(0, 80) : '',
        description: userQuery || '',
        subject: 'Other',
        tags: ['General']
      }
    });
  }
});

export default router;

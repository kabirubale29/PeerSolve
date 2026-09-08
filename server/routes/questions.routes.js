import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { store, sanitizeAuthor } from '../services/mockData.js';
import { generateEmbedding } from '../services/gemini.service.js';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const router = Router();

/**
 * GET /api/questions
 * Filter by tab, subject, tag, search query, status. Sanitizes author privacy.
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { tab = 'recent', subject, tag, search, status, limit = 20, offset = 0 } = req.query;
    const requestingUserId = req.user ? req.user.id : null;

    let items = [...store.questions];

    // Filter by subject
    if (subject && subject !== 'All') {
      items = items.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
    }

    // Filter by tag
    if (tag) {
      items = items.filter(q => q.tags && q.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }

    // Filter by status (open / solved)
    if (status) {
      items = items.filter(q => q.status === status);
    }

    // Search query filter (in title, description, topic, tags)
    if (search && search.trim()) {
      const qLower = search.trim().toLowerCase();
      items = items.filter(q =>
        q.title.toLowerCase().includes(qLower) ||
        q.description.toLowerCase().includes(qLower) ||
        (q.topic && q.topic.toLowerCase().includes(qLower)) ||
        (q.tags && q.tags.some(t => t.toLowerCase().includes(qLower)))
      );
    }

    // Tab Sorting & Filtering
    if (tab === 'popular') {
      items.sort((a, b) => (b.upvote_count - b.downvote_count) - (a.upvote_count - a.downvote_count));
    } else if (tab === 'unanswered') {
      // Questions with 0 answers or still open
      const answeredQuestionIds = new Set(store.answers.map(a => a.question_id));
      items = items.filter(q => !answeredQuestionIds.has(q.id) || q.status === 'open');
      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (tab === 'recommended' && req.user) {
      const currentUser = store.users.find(u => u.id === requestingUserId);
      const userSubjects = currentUser?.subjects || [];
      if (userSubjects.length > 0) {
        items.sort((a, b) => {
          const aMatch = userSubjects.includes(a.subject) ? 1 : 0;
          const bMatch = userSubjects.includes(b.subject) ? 1 : 0;
          return bMatch - aMatch;
        });
      }
    } else {
      // Recent (default)
      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Paginate and enrich with author & answer count
    const total = items.length;
    const paginated = items.slice(Number(offset), Number(offset) + Number(limit));

    const enriched = paginated.map(q => {
      const author = store.users.find(u => u.id === q.user_id);
      const answerCount = store.answers.filter(a => a.question_id === q.id).length;
      const hasAcceptedAnswer = store.answers.some(a => a.question_id === q.id && a.is_accepted);
      
      let userVote = null;
      if (requestingUserId) {
        const v = store.votes.find(v => v.user_id === requestingUserId && v.target_type === 'question' && v.target_id === q.id);
        if (v) userVote = v.vote_type;
      }

      return {
        id: q.id,
        title: q.title,
        description: q.description,
        subject: q.subject,
        topic: q.topic,
        tags: q.tags,
        status: q.status,
        views: q.views,
        upvote_count: q.upvote_count,
        downvote_count: q.downvote_count,
        score: q.upvote_count - q.downvote_count,
        answer_count: answerCount,
        has_accepted_answer: hasAcceptedAnswer,
        user_vote: userVote,
        created_at: q.created_at,
        updated_at: q.updated_at,
        author: sanitizeAuthor(author, q.is_anonymous, requestingUserId)
      };
    });

    res.json({ total, questions: enriched });
  } catch (err) {
    console.error('Fetch questions error:', err);
    res.status(500).json({ error: 'Unable to load questions.' });
  }
});

/**
 * GET /api/questions/:id
 * Detailed question view with soft-linked related questions
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user ? req.user.id : null;

    const question = store.questions.find(q => q.id === id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    // Increment view count
    question.views = (question.views || 0) + 1;

    const author = store.users.find(u => u.id === question.user_id);
    
    // Fetch soft-linked related questions
    const relatedQuestions = (question.related_question_ids || [])
      .map(relId => store.questions.find(q => q.id === relId))
      .filter(Boolean)
      .map(rel => ({
        id: rel.id,
        title: rel.title,
        subject: rel.subject,
        status: rel.status
      }));

    let userVote = null;
    if (requestingUserId) {
      const v = store.votes.find(v => v.user_id === requestingUserId && v.target_type === 'question' && v.target_id === question.id);
      if (v) userVote = v.vote_type;
    }

    res.json({
      id: question.id,
      title: question.title,
      description: question.description,
      subject: question.subject,
      topic: question.topic,
      tags: question.tags,
      status: question.status,
      views: question.views,
      upvote_count: question.upvote_count,
      downvote_count: question.downvote_count,
      score: question.upvote_count - question.downvote_count,
      user_vote: userVote,
      is_owner: requestingUserId ? requestingUserId === question.user_id : false,
      related_questions: relatedQuestions,
      created_at: question.created_at,
      updated_at: question.updated_at,
      author: sanitizeAuthor(author, question.is_anonymous, requestingUserId)
    });
  } catch (err) {
    console.error('Fetch question detail error:', err);
    res.status(500).json({ error: 'Unable to load question details.' });
  }
});

/**
 * POST /api/questions
 * Create a new question (never blocked by similar question advisory)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, subject, topic, tags, is_anonymous, related_question_ids } = req.body;
    const userId = req.user.id;

    if (!title || title.trim().length < 5) {
      return res.status(400).json({ error: 'Question title must be at least 5 characters.' });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a clear description of your doubt.' });
    }

    const newQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      title: title.trim(),
      description: description.trim(),
      subject: subject || 'Other',
      topic: topic ? topic.trim() : '',
      tags: Array.isArray(tags) ? tags.map(t => t.trim()).filter(Boolean) : [],
      is_anonymous: !!is_anonymous,
      status: 'open',
      views: 0,
      upvote_count: 0,
      downvote_count: 0,
      related_question_ids: Array.isArray(related_question_ids) ? related_question_ids : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.questions.unshift(newQuestion);

    // Asynchronously generate embedding for semantic search in background
    generateEmbedding(`${newQuestion.title} ${newQuestion.description}`).catch(err => {
      console.warn('Background embedding generation error:', err.message);
    });

    const author = store.users.find(u => u.id === userId);
    res.status(201).json({
      message: 'Question posted successfully!',
      question: {
        ...newQuestion,
        author: sanitizeAuthor(author, newQuestion.is_anonymous, userId)
      }
    });
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ error: 'Unable to post your question. Please try again.' });
  }
});

/**
 * PUT /api/questions/:id
 * Edit own question
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, topic, tags, is_anonymous } = req.body;
    const userId = req.user.id;

    const question = store.questions.find(q => q.id === id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    if (question.user_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own questions.' });
    }

    if (title) question.title = title.trim();
    if (description) question.description = description.trim();
    if (subject) question.subject = subject;
    if (topic !== undefined) question.topic = topic.trim();
    if (tags) question.tags = tags;
    if (is_anonymous !== undefined) question.is_anonymous = !!is_anonymous;
    question.updated_at = new Date().toISOString();

    res.json({ message: 'Question updated successfully.', question });
  } catch (err) {
    console.error('Edit question error:', err);
    res.status(500).json({ error: 'Unable to update question.' });
  }
});

/**
 * DELETE /api/questions/:id
 * Delete own question
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const index = store.questions.findIndex(q => q.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    if (store.questions[index].user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own questions.' });
    }

    store.questions.splice(index, 1);
    // Remove cascading answers and comments
    store.answers = store.answers.filter(a => a.question_id !== id);

    res.json({ message: 'Question deleted successfully.' });
  } catch (err) {
    console.error('Delete question error:', err);
    res.status(500).json({ error: 'Unable to delete question.' });
  }
});

export default router;

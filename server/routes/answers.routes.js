import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { store, sanitizeAuthor } from '../services/mockData.js';
import { verifyAnswer } from '../services/gemini.service.js';
import { REPORT_UNDER_REVIEW_THRESHOLD, REPUTATION_RULES } from '../config/constants.js';

const router = Router();

/**
 * GET /api/answers/question/:questionId
 * Fetch and sort answers (recommended, upvoted, newest) with anonymous author masking
 */
router.get('/question/:questionId', optionalAuth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { sort = 'recommended' } = req.query;
    const requestingUserId = req.user ? req.user.id : null;

    const question = store.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    let answers = store.answers.filter(a => a.question_id === questionId);

    // AI Status Weight for Recommended Sorting
    const aiWeights = {
      reviewed: 10,
      needs_review: 5,
      unavailable: 2,
      potential_issue: 0
    };

    // Sorting Logic
    if (sort === 'upvoted') {
      answers.sort((a, b) => (b.upvote_count - b.downvote_count) - (a.upvote_count - a.downvote_count));
    } else if (sort === 'newest') {
      answers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      // Recommended: Accepted > Upvotes > Author Reputation > AI Review Status > Recency
      answers.sort((a, b) => {
        // 1. Accepted answer always on top
        if (a.is_accepted && !b.is_accepted) return -1;
        if (!a.is_accepted && b.is_accepted) return 1;

        // 2. Net Upvotes
        const scoreA = a.upvote_count - a.downvote_count;
        const scoreB = b.upvote_count - b.downvote_count;
        if (scoreB !== scoreA) return scoreB - scoreA;

        // 3. Author reputation
        const authorA = store.users.find(u => u.id === a.user_id);
        const authorB = store.users.find(u => u.id === b.user_id);
        const repA = authorA?.reputation || 0;
        const repB = authorB?.reputation || 0;
        if (repB !== repA) return repB - repA;

        // 4. AI review status
        const aiScoreA = aiWeights[a.ai_status] ?? 2;
        const aiScoreB = aiWeights[b.ai_status] ?? 2;
        if (aiScoreB !== aiScoreA) return aiScoreB - aiScoreA;

        // 5. Recency
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }

    const enriched = answers.map(a => {
      const author = store.users.find(u => u.id === a.user_id);
      const commentsCount = store.comments.filter(c => c.answer_id === a.id).length;
      
      let userVote = null;
      if (requestingUserId) {
        const v = store.votes.find(v => v.user_id === requestingUserId && v.target_type === 'answer' && v.target_id === a.id);
        if (v) userVote = v.vote_type;
      }

      const isUnderReview = (a.report_count || 0) >= REPORT_UNDER_REVIEW_THRESHOLD;

      return {
        id: a.id,
        question_id: a.question_id,
        content: a.content,
        is_accepted: a.is_accepted,
        ai_status: a.ai_status,
        ai_feedback: a.ai_feedback,
        upvote_count: a.upvote_count,
        downvote_count: a.downvote_count,
        score: a.upvote_count - a.downvote_count,
        report_count: a.report_count || 0,
        is_under_review: isUnderReview,
        comments_count: commentsCount,
        user_vote: userVote,
        is_owner: requestingUserId ? requestingUserId === a.user_id : false,
        created_at: a.created_at,
        updated_at: a.updated_at,
        author: sanitizeAuthor(author, a.is_anonymous, requestingUserId)
      };
    });

    res.json({ answers: enriched });
  } catch (err) {
    console.error('Fetch answers error:', err);
    res.status(500).json({ error: 'Unable to load answers.' });
  }
});

/**
 * POST /api/answers
 * Submit an answer and trigger advisory AI verification
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { question_id, content, is_anonymous } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Answer content cannot be empty.' });
    }

    const question = store.questions.find(q => q.id === question_id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    // 1. Initial save with 'unavailable' or preliminary status
    const newAnswer = {
      id: `ans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question_id,
      user_id: userId,
      content: content.trim(),
      is_anonymous: !!is_anonymous,
      ai_status: 'unavailable',
      ai_feedback: 'Analyzing answer with AI...',
      is_accepted: false,
      upvote_count: 0,
      downvote_count: 0,
      report_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.answers.push(newAnswer);

    // 2. Trigger AI verification in parallel (5s timeout fallback)
    try {
      const aiResult = await verifyAnswer(
        question.title,
        question.description,
        newAnswer.content
      );
      newAnswer.ai_status = aiResult.status;
      newAnswer.ai_feedback = aiResult.feedback;
    } catch (aiErr) {
      console.warn('AI Verification fallback on submit:', aiErr.message);
      newAnswer.ai_status = 'unavailable';
      newAnswer.ai_feedback = 'AI review is temporarily unavailable. Your answer has still been saved.';
    }

    // 3. Create notification for question author (if not same user)
    if (question.user_id !== userId) {
      store.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: question.user_id,
        type: 'answer',
        message: `Someone posted an answer to your doubt: "${question.title.slice(0, 45)}..."`,
        link_url: `/question/${question.id}`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    const author = store.users.find(u => u.id === userId);
    res.status(201).json({
      message: 'Answer posted successfully!',
      answer: {
        ...newAnswer,
        author: sanitizeAuthor(author, newAnswer.is_anonymous, userId)
      }
    });
  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ error: 'Unable to submit your answer. Please try again.' });
  }
});

/**
 * PUT /api/answers/:id
 * Edit own answer -> Re-runs AI verification on the updated content
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, is_anonymous } = req.body;
    const userId = req.user.id;

    const answer = store.answers.find(a => a.id === id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    if (answer.user_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own answers.' });
    }

    if (content && content.trim()) {
      answer.content = content.trim();
    }
    if (is_anonymous !== undefined) {
      answer.is_anonymous = !!is_anonymous;
    }
    answer.updated_at = new Date().toISOString();

    // Re-run AI verification upon answer edit
    const question = store.questions.find(q => q.id === answer.question_id);
    if (question) {
      try {
        const aiResult = await verifyAnswer(
          question.title,
          question.description,
          answer.content
        );
        answer.ai_status = aiResult.status;
        answer.ai_feedback = aiResult.feedback;
      } catch (aiErr) {
        console.warn('AI Re-verification failed on edit:', aiErr.message);
        answer.ai_status = 'unavailable';
        answer.ai_feedback = 'AI review is temporarily unavailable.';
      }
    }

    const author = store.users.find(u => u.id === userId);
    res.json({
      message: 'Answer updated and re-verified by AI.',
      answer: {
        ...answer,
        author: sanitizeAuthor(author, answer.is_anonymous, userId)
      }
    });
  } catch (err) {
    console.error('Edit answer error:', err);
    res.status(500).json({ error: 'Unable to update answer.' });
  }
});

/**
 * DELETE /api/answers/:id
 * Delete own answer
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const index = store.answers.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    if (store.answers[index].user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own answers.' });
    }

    const answer = store.answers[index];
    // If was accepted, mark question open
    if (answer.is_accepted) {
      const q = store.questions.find(q => q.id === answer.question_id);
      if (q) q.status = 'open';
    }

    store.answers.splice(index, 1);
    store.comments = store.comments.filter(c => c.answer_id !== id);

    res.json({ message: 'Answer deleted successfully.' });
  } catch (err) {
    console.error('Delete answer error:', err);
    res.status(500).json({ error: 'Unable to delete answer.' });
  }
});

/**
 * POST /api/answers/:id/accept
 * Accept an answer (Only question author can accept, NO self-accepting)
 */
router.post('/:id/accept', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const answer = store.answers.find(a => a.id === id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    const question = store.questions.find(q => q.id === answer.question_id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    // Verify user is the question author
    if (question.user_id !== userId) {
      return res.status(403).json({ error: 'Only the question author can accept an answer.' });
    }

    // STRICT INVARIANT: User cannot accept their own answer to their own question
    if (answer.user_id === userId) {
      return res.status(400).json({ error: 'You cannot accept your own answer to your own question.' });
    }

    const wasAccepted = answer.is_accepted;
    const willBeAccepted = !wasAccepted;

    // Reset any previously accepted answers for this question
    if (willBeAccepted) {
      store.answers
        .filter(a => a.question_id === question.id && a.id !== id && a.is_accepted)
        .forEach(a => {
          a.is_accepted = false;
          // Deduct reputation
          const prevAuthor = store.users.find(u => u.id === a.user_id);
          if (prevAuthor) {
            prevAuthor.reputation = Math.max(0, prevAuthor.reputation - REPUTATION_RULES.ANSWER_ACCEPTED);
          }
        });

      answer.is_accepted = true;
      question.status = 'solved';

      // Award +25 reputation to answerer
      let answerAuthor = store.users.find(u => u.id === answer.user_id);
      if (!answerAuthor) {
        answerAuthor = {
          id: answer.user_id,
          name: 'Student',
          year: 2,
          branch: 'Computer Science',
          role: 'junior',
          reputation: 0,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${answer.user_id}`
        };
        store.users.push(answerAuthor);
      }
      
      answerAuthor.reputation = (answerAuthor.reputation || 0) + REPUTATION_RULES.ANSWER_ACCEPTED;

      // Also award 'First Solution' badge if this is their first accepted answer
      const userAcceptedCount = store.answers.filter(a => a.user_id === answer.user_id && a.is_accepted).length;
      if (userAcceptedCount === 1) {
        if (!store.user_badges.some(ub => ub.user_id === answer.user_id && ub.badge_slug === 'first_solution')) {
          store.user_badges.push({
            id: `ub-${Date.now()}`,
            user_id: answer.user_id,
            badge_slug: 'first_solution',
            created_at: new Date().toISOString()
          });
        }
      }

      // Sync reputation to Supabase if configured
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('profiles').update({ reputation: answerAuthor.reputation }).eq('id', answer.user_id);
        } catch (dbErr) {
          console.warn('Supabase DB reputation sync note:', dbErr.message);
        }
      }

      // Send notification to answerer
      store.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: answer.user_id,
        type: 'accepted',
        message: `Your answer on "${question.title.slice(0, 40)}..." was accepted! (+25 Reputation)`,
        link_url: `/question/${question.id}`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    } else {
      // Unaccept
      answer.is_accepted = false;
      question.status = 'open';

      const answerAuthor = store.users.find(u => u.id === answer.user_id);
      if (answerAuthor) {
        answerAuthor.reputation = Math.max(0, (answerAuthor.reputation || 0) - REPUTATION_RULES.ANSWER_ACCEPTED);
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('profiles').update({ reputation: answerAuthor.reputation }).eq('id', answer.user_id);
          } catch (dbErr) {
            console.warn('Supabase DB reputation sync note:', dbErr.message);
          }
        }
      }
    }

    res.json({
      message: willBeAccepted ? 'Answer accepted! (+25 Rep awarded to answerer)' : 'Answer unaccepted.',
      is_accepted: answer.is_accepted,
      question_status: question.status
    });
  } catch (err) {
    console.error('Accept answer error:', err);
    res.status(500).json({ error: 'Unable to accept answer.' });
  }
});

export default router;

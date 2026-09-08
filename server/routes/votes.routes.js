import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { store } from '../services/mockData.js';
import { REPUTATION_RULES } from '../config/constants.js';

const router = Router();

/**
 * POST /api/votes
 * Vote up or down on a question or answer
 * Enforces:
 *   - No voting on own content
 *   - Single vote per item (flips or toggles off)
 *   - Atomic count and reputation updates
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { target_type, target_id, vote_type } = req.body;
    const userId = req.user.id;

    if (!['question', 'answer'].includes(target_type)) {
      return res.status(400).json({ error: 'target_type must be "question" or "answer".' });
    }
    if (!['up', 'down'].includes(vote_type)) {
      return res.status(400).json({ error: 'vote_type must be "up" or "down".' });
    }

    // Find target
    const target = target_type === 'question'
      ? store.questions.find(q => q.id === target_id)
      : store.answers.find(a => a.id === target_id);

    if (!target) {
      return res.status(404).json({ error: `${target_type} not found.` });
    }

    // STRICT INVARIANT: Cannot vote on own content
    if (target.user_id === userId) {
      return res.status(400).json({ error: `You cannot vote on your own ${target_type}.` });
    }

    const targetAuthor = store.users.find(u => u.id === target.user_id);

    // Look for existing vote
    const existingIndex = store.votes.findIndex(
      v => v.user_id === userId && v.target_type === target_type && v.target_id === target_id
    );

    let currentVote = null;

    if (existingIndex > -1) {
      const existingVote = store.votes[existingIndex];

      if (existingVote.vote_type === vote_type) {
        // Toggle OFF (remove vote)
        store.votes.splice(existingIndex, 1);

        if (vote_type === 'up') {
          target.upvote_count = Math.max(0, target.upvote_count - 1);
          if (targetAuthor) {
            const repDelta = target_type === 'question' ? REPUTATION_RULES.QUESTION_UPVOTE : REPUTATION_RULES.ANSWER_UPVOTE;
            targetAuthor.reputation = Math.max(0, targetAuthor.reputation - repDelta);
          }
        } else {
          target.downvote_count = Math.max(0, target.downvote_count - 1);
          if (targetAuthor && target_type === 'answer') {
            targetAuthor.reputation += 2; // undo -2
          }
        }
        currentVote = null;
      } else {
        // FLIP vote (e.g. down -> up or up -> down)
        existingVote.vote_type = vote_type;

        if (vote_type === 'up') {
          target.downvote_count = Math.max(0, target.downvote_count - 1);
          target.upvote_count += 1;
          if (targetAuthor) {
            const repDelta = target_type === 'question' ? REPUTATION_RULES.QUESTION_UPVOTE : (REPUTATION_RULES.ANSWER_UPVOTE + 2);
            targetAuthor.reputation += repDelta;
          }
        } else {
          target.upvote_count = Math.max(0, target.upvote_count - 1);
          target.downvote_count += 1;
          if (targetAuthor) {
            const repDelta = target_type === 'question' ? REPUTATION_RULES.QUESTION_UPVOTE : (REPUTATION_RULES.ANSWER_UPVOTE + 2);
            targetAuthor.reputation = Math.max(0, targetAuthor.reputation - repDelta);
          }
        }
        currentVote = vote_type;
      }
    } else {
      // NEW Vote
      store.votes.push({
        id: `vote-${Date.now()}`,
        user_id: userId,
        target_type,
        target_id,
        vote_type,
        created_at: new Date().toISOString()
      });

      if (vote_type === 'up') {
        target.upvote_count += 1;
        if (targetAuthor) {
          const repDelta = target_type === 'question' ? REPUTATION_RULES.QUESTION_UPVOTE : REPUTATION_RULES.ANSWER_UPVOTE;
          targetAuthor.reputation += repDelta;
        }

        // Notify answer author when upvoted
        if (target_type === 'answer' && target.user_id !== userId) {
          store.notifications.unshift({
            id: `notif-${Date.now()}`,
            user_id: target.user_id,
            type: 'upvote',
            message: `Your answer received an upvote! (+${REPUTATION_RULES.ANSWER_UPVOTE} Rep)`,
            link_url: `/question/${target.question_id}`,
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      } else {
        target.downvote_count += 1;
        if (targetAuthor && target_type === 'answer') {
          targetAuthor.reputation = Math.max(0, targetAuthor.reputation + REPUTATION_RULES.ANSWER_DOWNVOTE);
        }
      }
      currentVote = vote_type;
    }

    res.json({
      success: true,
      current_vote: currentVote,
      upvote_count: target.upvote_count,
      downvote_count: target.downvote_count,
      score: target.upvote_count - target.downvote_count
    });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Unable to cast vote.' });
  }
});

export default router;

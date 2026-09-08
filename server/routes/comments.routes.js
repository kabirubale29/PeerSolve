import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { store } from '../services/mockData.js';

const router = Router();

/**
 * GET /api/comments/answer/:answerId
 * Fetch flat comments for an answer
 */
router.get('/answer/:answerId', optionalAuth, async (req, res) => {
  try {
    const { answerId } = req.params;
    const comments = store.comments.filter(c => c.answer_id === answerId);

    const enriched = comments.map(c => {
      const author = store.users.find(u => u.id === c.user_id);
      return {
        id: c.id,
        answer_id: c.answer_id,
        content: c.content,
        created_at: c.created_at,
        author: {
          id: author?.id,
          name: author?.name || 'Student',
          role: author?.role || 'junior',
          avatar_url: author?.avatar_url
        }
      };
    });

    res.json({ comments: enriched });
  } catch (err) {
    console.error('Fetch comments error:', err);
    res.status(500).json({ error: 'Unable to load comments.' });
  }
});

/**
 * POST /api/comments
 * Add a comment to an answer (flat, non-threaded)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { answer_id, content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const answer = store.answers.find(a => a.id === answer_id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      answer_id,
      user_id: userId,
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    store.comments.push(newComment);

    // Notify answer author if not the same user
    if (answer.user_id !== userId) {
      const commenter = store.users.find(u => u.id === userId);
      store.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: answer.user_id,
        type: 'comment',
        message: `${commenter?.name || 'A student'} commented on your answer: "${newComment.content.slice(0, 40)}..."`,
        link_url: `/question/${answer.question_id}`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    const author = store.users.find(u => u.id === userId);
    res.status(201).json({
      message: 'Comment added.',
      comment: {
        ...newComment,
        author: {
          id: author?.id,
          name: author?.name || 'Student',
          role: author?.role || 'junior',
          avatar_url: author?.avatar_url
        }
      }
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Unable to add comment.' });
  }
});

/**
 * DELETE /api/comments/:id
 * Delete own comment
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const index = store.comments.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (store.comments[index].user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own comments.' });
    }

    store.comments.splice(index, 1);
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: 'Unable to delete comment.' });
  }
});

export default router;

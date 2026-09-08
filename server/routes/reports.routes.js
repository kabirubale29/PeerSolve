import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { store } from '../services/mockData.js';
import { REPORT_UNDER_REVIEW_THRESHOLD } from '../config/constants.js';

const router = Router();

/**
 * POST /api/reports
 * Report an answer for incorrect info, misleading explanation, or abuse.
 * Enforces:
 *   - 1 report per user per answer limit
 *   - 3+ distinct reports -> Marks answer "Under Review" (visible, not hidden)
 *   - Notifies author
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { answer_id, reason, proof } = req.body;
    const userId = req.user.id;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Please provide a valid reason for reporting.' });
    }

    const answer = store.answers.find(a => a.id === answer_id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    // Check duplicate report by same user
    const existingReport = store.reports.find(
      r => r.answer_id === answer_id && r.reporter_id === userId
    );

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this answer.' });
    }

    // Save report
    const newReport = {
      id: `rep-${Date.now()}`,
      answer_id,
      reporter_id: userId,
      reason: reason.trim(),
      proof: proof ? proof.trim() : '',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    store.reports.push(newReport);

    // Increment count on answer
    answer.report_count = (answer.report_count || 0) + 1;
    const isUnderReview = answer.report_count >= REPORT_UNDER_REVIEW_THRESHOLD;

    // Notify author if not reported by self
    if (answer.user_id !== userId) {
      store.notifications.unshift({
        id: `notif-${Date.now()}`,
        user_id: answer.user_id,
        type: 'reported',
        message: `Your answer on question has received a community report for: "${reason}". You can review and edit your answer.`,
        link_url: `/question/${answer.question_id}`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    res.status(201).json({
      message: 'Report submitted for review. Thank you for keeping the academic community accurate.',
      report_count: answer.report_count,
      is_under_review: isUnderReview
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Unable to submit report.' });
  }
});

export default router;

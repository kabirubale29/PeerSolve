import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { store } from '../services/mockData.js';

const router = Router();

/**
 * GET /api/notifications
 * Get notifications for current user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userNotifs = store.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const unreadCount = userNotifs.filter(n => !n.is_read).length;

    res.json({
      unread_count: unreadCount,
      notifications: userNotifs
    });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Unable to load notifications.' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notif = store.notifications.find(n => n.id === id && n.user_id === userId);
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    notif.is_read = true;
    res.json({ success: true, notification: notif });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Unable to update notification.' });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for current user
 */
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    store.notifications
      .filter(n => n.user_id === userId)
      .forEach(n => {
        n.is_read = true;
      });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Unable to update notifications.' });
  }
});

export default router;

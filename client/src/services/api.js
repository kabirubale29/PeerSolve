const API_BASE_URL = '/api';

/**
 * Universal Fetch wrapper with auth header injection
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('peersolve_auth_token');
  const demoUserId = localStorage.getItem('peersolve_demo_user_id') || 'a1111111-1111-1111-1111-111111111111';

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['x-demo-user-id'] = demoUserId;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `HTTP error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // AI Endpoints
  getSimilarQuestions: (query) => request('/ai/similar-questions', {
    method: 'POST',
    body: JSON.stringify({ query })
  }),
  verifyAnswer: (payload) => request('/ai/verify-answer', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  improveQuestion: (payload) => request('/ai/improve-question', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  assistantChat: (payload) => request('/ai/assistant-chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Questions
  getQuestions: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return request(`/questions?${queryStr}`);
  },
  getQuestion: (id) => request(`/questions/${id}`),
  createQuestion: (payload) => request('/questions', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateQuestion: (id, payload) => request(`/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteQuestion: (id) => request(`/questions/${id}`, {
    method: 'DELETE'
  }),

  // Answers
  getAnswers: (questionId, sort = 'recommended') => request(`/answers/question/${questionId}?sort=${sort}`),
  submitAnswer: (payload) => request('/answers', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateAnswer: (id, payload) => request(`/answers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteAnswer: (id) => request(`/answers/${id}`, {
    method: 'DELETE'
  }),
  acceptAnswer: (id) => request(`/answers/${id}/accept`, {
    method: 'POST'
  }),

  // Votes
  castVote: (payload) => request('/votes', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Comments
  getComments: (answerId) => request(`/comments/answer/${answerId}`),
  addComment: (payload) => request('/comments', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteComment: (id) => request(`/comments/${id}`, {
    method: 'DELETE'
  }),

  // Reports
  submitReport: (payload) => request('/reports', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, {
    method: 'PATCH'
  }),
  markAllNotificationsRead: () => request('/notifications/read-all', {
    method: 'PATCH'
  }),

  // Users
  getMyProfile: () => request('/users/me'),
  getUserProfile: (id) => request(`/users/${id}`),
  updateMyProfile: (payload) => request('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  getDemoUsers: () => request('/users/all/demo-users')
};

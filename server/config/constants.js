// Academic & Platform Configuration Constants

export const SENIOR_YEAR_THRESHOLD = 3; // Year 3+ = Senior, Year 1-2 = Junior

export const REPUTATION_RULES = {
  QUESTION_UPVOTE: 2,
  QUESTION_DOWNVOTE: 0,
  ANSWER_UPVOTE: 5,
  ANSWER_DOWNVOTE: -2,
  ANSWER_ACCEPTED: 25,
};

export const REPORT_UNDER_REVIEW_THRESHOLD = 3;

export const AI_CONFIG = {
  MODEL_NAME: 'gemini-1.5-flash',
  EMBEDDING_MODEL: 'text-embedding-004',
  TIMEOUT_MS: 25000,
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 20,     // 20 requests per minute per IP/user
};

export const SUBJECTS = [
  'Java',
  'Python',
  'Data Structures',
  'Algorithms',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'Mathematics',
  'Electronics',
  'Other',
];

export const BADGE_DEFINITIONS = [
  {
    slug: 'problem-solver',
    name: 'Problem Solver',
    description: 'Earned for having your first answer accepted by a peer.',
    icon: '🏆',
  },
  {
    slug: 'senior-mentor',
    name: 'Senior Mentor',
    description: 'Awarded to seniors who have helped 5+ junior students resolve doubts.',
    icon: '🎓',
  },
  {
    slug: 'helpful-contributor',
    name: 'Helpful Contributor',
    description: 'Received 10+ upvotes across community answers.',
    icon: '🔥',
  },
  {
    slug: 'knowledge-builder',
    name: 'Knowledge Builder',
    description: 'Contributed 15+ verified answers into reusable academic knowledge.',
    icon: '📚',
  },
  {
    slug: 'trusted-contributor',
    name: 'Trusted Contributor',
    description: 'Exceeded 500 community reputation points.',
    icon: '⭐',
  },
];

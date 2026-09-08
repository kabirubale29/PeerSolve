import { REPUTATION_RULES, REPORT_UNDER_REVIEW_THRESHOLD } from '../config/constants.js';

// Cosine similarity helper
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Initial In-Memory State
export const store = {
  users: [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      name: 'Rahul Sharma',
      year: 2,
      branch: 'Computer Science',
      role: 'junior',
      reputation: 85,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
      bio: '2nd year CS student eager to master algorithms and OOP.',
      subjects: ['Java', 'Data Structures', 'DBMS']
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      name: 'Priya Patel',
      year: 4,
      branch: 'Information Technology',
      role: 'senior',
      reputation: 847,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      bio: 'Final year IT student. Love mentoring juniors in Systems, Java, and Networks.',
      subjects: ['Java', 'Operating Systems', 'Computer Networks', 'DBMS']
    },
    {
      id: 'c3333333-3333-3333-3333-333333333333',
      name: 'Aman Verma',
      year: 3,
      branch: 'Computer Science',
      role: 'senior',
      reputation: 420,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aman',
      bio: 'Pre-final year enthusiast. Focused on competitive programming & clean architecture.',
      subjects: ['Data Structures', 'Algorithms', 'Operating Systems']
    },
    {
      id: 'd4444444-4444-4444-4444-444444444444',
      name: 'Sneha Reddy',
      year: 1,
      branch: 'Electronics & CS',
      role: 'junior',
      reputation: 40,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
      bio: 'First year explorer passionate about foundations and digital logic.',
      subjects: ['Mathematics', 'Java', 'Electronics']
    }
  ],
  badges: [
    {
      id: 'b0000001-0000-0000-0000-000000000001',
      name: 'Problem Solver',
      description: 'Earned for having your first answer accepted by a peer.',
      icon: '🏆',
      slug: 'problem-solver'
    },
    {
      id: 'b0000002-0000-0000-0000-000000000002',
      name: 'Senior Mentor',
      description: 'Awarded to seniors who have helped 5+ junior students resolve academic doubts.',
      icon: '🎓',
      slug: 'senior-mentor'
    },
    {
      id: 'b0000003-0000-0000-0000-000000000003',
      name: 'Helpful Contributor',
      description: 'Received 10+ upvotes across community answers.',
      icon: '🔥',
      slug: 'helpful-contributor'
    },
    {
      id: 'b0000004-0000-0000-0000-000000000004',
      name: 'Knowledge Builder',
      description: 'Contributed 15+ verified answers into reusable academic knowledge.',
      icon: '📚',
      slug: 'knowledge-builder'
    },
    {
      id: 'b0000005-0000-0000-0000-000000000005',
      name: 'Trusted Contributor',
      description: 'Exceeded 500 community reputation points.',
      icon: '⭐',
      slug: 'trusted-contributor'
    }
  ],
  user_badges: [
    { user_id: 'b2222222-2222-2222-2222-222222222222', badge_slug: 'problem-solver' },
    { user_id: 'b2222222-2222-2222-2222-222222222222', badge_slug: 'senior-mentor' },
    { user_id: 'b2222222-2222-2222-2222-222222222222', badge_slug: 'helpful-contributor' },
    { user_id: 'b2222222-2222-2222-2222-222222222222', badge_slug: 'trusted-contributor' },
    { user_id: 'c3333333-3333-3333-3333-333333333333', badge_slug: 'problem-solver' },
    { user_id: 'c3333333-3333-3333-3333-333333333333', badge_slug: 'helpful-contributor' },
    { user_id: 'a1111111-1111-1111-1111-111111111111', badge_slug: 'problem-solver' }
  ],
  questions: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      user_id: 'a1111111-1111-1111-1111-111111111111',
      title: 'What is polymorphism in Java?',
      description: 'I am learning Object-Oriented Programming in Java and I keep hearing the term polymorphism. Can someone explain what it actually means in plain terms and how Java achieves it?',
      subject: 'Java',
      topic: 'Object Oriented Programming',
      tags: ['OOP', 'Java', 'Polymorphism', 'Foundations'],
      is_anonymous: false,
      status: 'solved',
      views: 142,
      upvote_count: 18,
      downvote_count: 0,
      related_question_ids: ['22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'],
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      user_id: 'd4444444-4444-4444-4444-444444444444',
      title: 'Runtime vs compile-time polymorphism in Java',
      description: 'What is the fundamental difference between method overloading (compile-time) and method overriding (runtime) in Java? When does dynamic method dispatch occur?',
      subject: 'Java',
      topic: 'Method Overriding & Dispatch',
      tags: ['Java', 'Polymorphism', 'Overloading', 'Overriding'],
      is_anonymous: false,
      status: 'solved',
      views: 98,
      upvote_count: 12,
      downvote_count: 0,
      related_question_ids: ['11111111-1111-1111-1111-111111111111'],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      user_id: 'a1111111-1111-1111-1111-111111111111',
      title: 'Examples of polymorphism in Java with practical code',
      description: 'I understand the theoretical definition, but could someone provide a real-world code example such as a Shape or PaymentGateway hierarchy demonstrating dynamic binding?',
      subject: 'Java',
      topic: 'Practical Examples',
      tags: ['Java', 'OOP', 'CodeExample'],
      is_anonymous: true,
      status: 'open',
      views: 45,
      upvote_count: 5,
      downvote_count: 0,
      related_question_ids: ['11111111-1111-1111-1111-111111111111'],
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      user_id: 'd4444444-4444-4444-4444-444444444444',
      title: 'Why is Binary Search time complexity O(log n) instead of O(n)?',
      description: 'Can someone provide a mathematical and intuitive breakdown of why dividing the search space in half each iteration leads to logarithmic time?',
      subject: 'Data Structures',
      topic: 'Search Algorithms',
      tags: ['Algorithms', 'BinarySearch', 'Complexity', 'DSA'],
      is_anonymous: false,
      status: 'solved',
      views: 230,
      upvote_count: 34,
      downvote_count: 0,
      related_question_ids: [],
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      user_id: 'a1111111-1111-1111-1111-111111111111',
      title: 'Difference between Process and Thread in Operating Systems',
      description: 'Why are threads often called lightweight processes? What memory segments do threads share versus what segments are unique to each thread?',
      subject: 'Operating Systems',
      topic: 'Process Management',
      tags: ['OS', 'Process', 'Threads', 'Concurrency'],
      is_anonymous: false,
      status: 'solved',
      views: 189,
      upvote_count: 27,
      downvote_count: 0,
      related_question_ids: [],
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      user_id: 'd4444444-4444-4444-4444-444444444444',
      title: 'How does Database Normalization (1NF, 2NF, 3NF) reduce redundancy?',
      description: 'In DBMS, what are the exact conditions for 2NF and 3NF, and what is the difference between partial dependency and transitive dependency?',
      subject: 'DBMS',
      topic: 'Relational Design',
      tags: ['DBMS', 'SQL', 'Normalization', 'Database'],
      is_anonymous: false,
      status: 'open',
      views: 76,
      upvote_count: 8,
      downvote_count: 0,
      related_question_ids: [],
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ],
  answers: [
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      question_id: '11111111-1111-1111-1111-111111111111',
      user_id: 'b2222222-2222-2222-2222-222222222222',
      content: `Polymorphism comes from Greek words: "poly" (many) and "morph" (form). In Java, it allows an object to take on many forms.

The two main types in Java are:
1. **Compile-time Polymorphism (Static Binding)**: Achieved through **Method Overloading** (same method name, different parameter lists). The compiler resolves which method to call at compile time.
2. **Runtime Polymorphism (Dynamic Binding)**: Achieved through **Method Overriding** (child class implements a method defined in parent class). The JVM uses Dynamic Method Dispatch to execute the child's version based on the actual object on the heap at runtime.

Example:
\`\`\`java
Animal myPet = new Dog(); // Dog extends Animal
myPet.makeSound(); // Calls Dog's overridden makeSound() dynamically!
\`\`\``,
      is_anonymous: false,
      ai_status: 'reviewed',
      ai_feedback: 'Accurate, clear, and comprehensive breakdown of compile-time vs runtime polymorphism in Java with correct dynamic method dispatch details.',
      is_accepted: true,
      upvote_count: 42,
      downvote_count: 0,
      report_count: 0,
      created_at: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString()
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      question_id: '22222222-2222-2222-2222-222222222222',
      user_id: 'c3333333-3333-3333-3333-333333333333',
      content: `Key differences:
- **Binding Time**: Overloading is resolved at compile time by checking method signatures. Overriding is resolved at runtime by examining the object type via the virtual method table (vtable).
- **Class Scope**: Overloading happens within the same class or inherited hierarchy. Overriding strictly requires an inheritance relationship.
- **Return Types**: Overloading allows changing return types if parameters differ. Overriding requires covariant return types.`,
      is_anonymous: false,
      ai_status: 'reviewed',
      ai_feedback: 'Clear, concise, and technically accurate comparison of runtime vs compile-time polymorphism in Java.',
      is_accepted: true,
      upvote_count: 28,
      downvote_count: 0,
      report_count: 0,
      created_at: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString()
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      question_id: '44444444-4444-4444-4444-444444444444',
      user_id: 'c3333333-3333-3333-3333-333333333333',
      content: `Consider array size N = 16:
- Iteration 1: 16 -> 8 remaining
- Iteration 2: 8 -> 4 remaining
- Iteration 3: 4 -> 2 remaining
- Iteration 4: 2 -> 1 remaining

After k steps, remaining size is N / (2^k).
We finish when N / (2^k) = 1, which means 2^k = N.
Taking logarithm on both sides gives k = log2(N). Therefore, the time complexity is O(log n).`,
      is_anonymous: false,
      ai_status: 'reviewed',
      ai_feedback: 'Mathematically sound derivation showing how halving the search space yields logarithmic complexity.',
      is_accepted: true,
      upvote_count: 35,
      downvote_count: 0,
      report_count: 0,
      created_at: new Date(Date.now() - 86400000 * 4 + 5000000).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 4 + 5000000).toISOString()
    },
    {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      question_id: '44444444-4444-4444-4444-444444444444',
      user_id: 'a1111111-1111-1111-1111-111111111111',
      content: 'Binary search iterates across each element from start to finish until finding the target, so it takes linear O(n) steps in worst case.',
      is_anonymous: false,
      ai_status: 'potential_issue',
      ai_feedback: 'Potential issue detected: This answer describes Linear Search, not Binary Search. Binary Search requires a sorted array and achieves O(log n) complexity by halving the search interval.',
      is_accepted: false,
      upvote_count: 1,
      downvote_count: 5,
      report_count: 3,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ],
  votes: [
    { id: 'v1', user_id: 'b2222222-2222-2222-2222-222222222222', target_type: 'question', target_id: '11111111-1111-1111-1111-111111111111', vote_type: 'up' },
    { id: 'v2', user_id: 'a1111111-1111-1111-1111-111111111111', target_type: 'answer', target_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', vote_type: 'up' },
    { id: 'v3', user_id: 'c3333333-3333-3333-3333-333333333333', target_type: 'answer', target_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', vote_type: 'up' }
  ],
  comments: [
    {
      id: 'c0000001-0000-0000-0000-000000000001',
      answer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      user_id: 'd4444444-4444-4444-4444-444444444444',
      content: 'This makes total sense now! Does Java support multiple inheritance through polymorphism?',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'c0000002-0000-0000-0000-000000000002',
      answer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      user_id: 'b2222222-2222-2222-2222-222222222222',
      content: 'Great follow-up! Through interfaces, yes — a class can implement multiple interfaces and be treated polymorphically as any of them.',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  reports: [
    {
      id: 'r1',
      answer_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      reporter_id: 'b2222222-2222-2222-2222-222222222222',
      reason: 'Incorrect information',
      proof: 'Confuses binary search with linear search',
      status: 'pending',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'r2',
      answer_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      reporter_id: 'c3333333-3333-3333-3333-333333333333',
      reason: 'Misleading explanation',
      proof: 'States binary search is O(n)',
      status: 'pending',
      created_at: new Date(Date.now() - 40000000).toISOString()
    },
    {
      id: 'r3',
      answer_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      reporter_id: 'd4444444-4444-4444-4444-444444444444',
      reason: 'Incorrect information',
      proof: 'Incorrect complexity analysis',
      status: 'pending',
      created_at: new Date(Date.now() - 20000000).toISOString()
    }
  ],
  notifications: [
    {
      id: 'n1',
      user_id: 'b2222222-2222-2222-2222-222222222222',
      type: 'accepted',
      message: 'Your answer on "What is polymorphism in Java?" was marked as accepted! (+25 Rep)',
      link_url: '/question/11111111-1111-1111-1111-111111111111',
      is_read: false,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'n2',
      user_id: 'b2222222-2222-2222-2222-222222222222',
      type: 'comment',
      message: 'Sneha Reddy commented on your answer to "What is polymorphism in Java?"',
      link_url: '/question/11111111-1111-1111-1111-111111111111',
      is_read: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'n3',
      user_id: 'a1111111-1111-1111-1111-111111111111',
      type: 'reported',
      message: 'Your answer on "Why is Binary Search time complexity..." has been reported for review.',
      link_url: '/question/44444444-4444-4444-4444-444444444444',
      is_read: false,
      created_at: new Date(Date.now() - 20000000).toISOString()
    }
  ]
};

/**
 * Sanitizes question / answer authors to guarantee anonymous privacy
 */
export function sanitizeAuthor(author, isAnonymous, requestingUserId) {
  if (!author) {
    return {
      name: 'Community Member',
      role: 'junior',
      reputation: 0,
      avatar_url: null,
      isAnonymous: true
    };
  }

  // If anonymous and requesting user is NOT the author, mask identity
  if (isAnonymous && (!requestingUserId || requestingUserId !== author.id)) {
    return {
      name: 'Anonymous Student',
      role: author.role, // Academic role is allowed per spec ("role is not identity and can still be shown")
      reputation: author.reputation,
      avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=anonymous',
      isAnonymous: true
    };
  }

  return {
    id: author.id,
    name: author.name,
    role: author.role,
    year: author.year,
    branch: author.branch,
    reputation: author.reputation,
    avatar_url: author.avatar_url,
    isAnonymous: !!isAnonymous
  };
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper to generate a 768-dimensional normalized vector
function generateSemanticVector(clusterId, variation = 0.1) {
  const dim = 768;
  const vec = new Float32Array(dim);
  let norm = 0;

  for (let i = 0; i < dim; i++) {
    // base signal based on cluster
    const base = Math.sin((i + 1) * (clusterId + 1) * 0.45);
    const noise = (Math.random() - 0.5) * variation;
    const val = base + noise;
    vec[i] = val;
    norm += val * val;
  }

  norm = Math.sqrt(norm);
  const result = [];
  for (let i = 0; i < dim; i++) {
    result.push((vec[i] / norm).toFixed(6));
  }
  return `[${result.join(',')}]`;
}

// User UUIDs
const U1 = 'a1111111-1111-1111-1111-111111111111'; // Rahul (Junior, Yr 2)
const U2 = 'b2222222-2222-2222-2222-222222222222'; // Priya (Senior, Yr 4)
const U3 = 'c3333333-3333-3333-3333-333333333333'; // Aman (Senior, Yr 3)
const U4 = 'd4444444-4444-4444-4444-444444444444'; // Sneha (Junior, Yr 1)

// Question UUIDs
const Q1 = '11111111-1111-1111-1111-111111111111'; // Polymorphism in Java (Solved)
const Q2 = '22222222-2222-2222-2222-222222222222'; // Runtime vs compile-time polymorphism (Solved)
const Q3 = '33333333-3333-3333-3333-333333333333'; // Examples of polymorphism (Open)
const Q4 = '44444444-4444-4444-4444-444444444444'; // Binary Search O(log n) (Solved)
const Q5 = '55555555-5555-5555-5555-555555555555'; // Process vs Thread (Solved)
const Q6 = '66666666-6666-6666-6666-666666666666'; // Normalization 1NF 2NF 3NF (Open)
const Q7 = '77777777-7777-7777-7777-777777777777'; // TCP 3-Way Handshake (Solved)
const Q8 = '88888888-8888-8888-8888-888888888888'; // Virtual Memory Paging (Open)

// Answer UUIDs
const A1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const A2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const A3 = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const A4 = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const A5 = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const A6 = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const A7 = '10101010-1010-1010-1010-101010101010';

// Cluster 1: Java Polymorphism (Q1, Q2, Q3)
const vecQ1 = generateSemanticVector(1, 0.05);
const vecQ2 = generateSemanticVector(1, 0.08);
const vecQ3 = generateSemanticVector(1, 0.12);

// Cluster 2: Algorithms / Binary Search
const vecQ4 = generateSemanticVector(2, 0.05);

// Cluster 3: OS Process/Thread
const vecQ5 = generateSemanticVector(3, 0.05);

// Cluster 4: DBMS Normalization
const vecQ6 = generateSemanticVector(4, 0.05);

// Cluster 5: Networks TCP
const vecQ7 = generateSemanticVector(5, 0.05);

// Cluster 6: OS Virtual Memory
const vecQ8 = generateSemanticVector(6, 0.05);

const seedSql = `-- ============================================================================
-- PEERSOLVE SEED DATA
-- Includes Realistic Students, Badges, Questions, Vector Embeddings & Answers
-- ============================================================================

-- 1. Insert Badges
INSERT INTO badges (id, name, description, icon, slug) VALUES
('b0000001-0000-0000-0000-000000000001', 'Problem Solver', 'Earned for having your first answer accepted by a peer.', '🏆', 'problem-solver'),
('b0000002-0000-0000-0000-000000000002', 'Senior Mentor', 'Awarded to seniors who have helped 5+ junior students resolve academic doubts.', '🎓', 'senior-mentor'),
('b0000003-0000-0000-0000-000000000003', 'Helpful Contributor', 'Received 10+ upvotes across community answers.', '🔥', 'helpful-contributor'),
('b0000004-0000-0000-0000-000000000004', 'Knowledge Builder', 'Contributed 15+ verified answers into reusable academic knowledge.', '📚', 'knowledge-builder'),
('b0000005-0000-0000-0000-000000000005', 'Trusted Contributor', 'Exceeded 500 community reputation points with 95%+ positive rating.', '⭐', 'trusted-contributor')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Profiles
INSERT INTO profiles (id, name, year, branch, role, reputation, avatar_url, bio, subjects) VALUES
('${U1}', 'Rahul Sharma', 2, 'Computer Science', 'junior', 85, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul', '2nd year CS student eager to master algorithms and OOP.', ARRAY['Java', 'Data Structures', 'DBMS']),
('${U2}', 'Priya Patel', 4, 'Information Technology', 'senior', 847, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', 'Final year IT student. Love mentoring juniors in Systems, Java, and Networks.', ARRAY['Java', 'Operating Systems', 'Computer Networks', 'DBMS']),
('${U3}', 'Aman Verma', 3, 'Computer Science', 'senior', 420, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aman', 'Pre-final year enthusiast. Focused on competitive programming & clean architecture.', ARRAY['Data Structures', 'Algorithms', 'Operating Systems']),
('${U4}', 'Sneha Reddy', 1, 'Electronics & CS', 'junior', 40, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha', 'First year explorer passionate about foundations and digital logic.', ARRAY['Mathematics', 'Java', 'Electronics'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  year = EXCLUDED.year,
  role = EXCLUDED.role,
  reputation = EXCLUDED.reputation;

-- 3. Award Seed Badges
INSERT INTO user_badges (user_id, badge_id) VALUES
('${U2}', 'b0000001-0000-0000-0000-000000000001'),
('${U2}', 'b0000002-0000-0000-0000-000000000002'),
('${U2}', 'b0000003-0000-0000-0000-000000000003'),
('${U2}', 'b0000005-0000-0000-0000-000000000005'),
('${U3}', 'b0000001-0000-0000-0000-000000000001'),
('${U3}', 'b0000003-0000-0000-0000-000000000003'),
('${U1}', 'b0000001-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 4. Insert Questions with Embeddings
INSERT INTO questions (id, user_id, title, description, subject, topic, tags, is_anonymous, status, views, upvote_count, downvote_count, embedding, related_question_ids) VALUES
(
  '${Q1}',
  '${U1}',
  'What is polymorphism in Java?',
  'I am learning Object-Oriented Programming in Java and I keep hearing the term polymorphism. Can someone explain what it actually means in plain terms and how Java achieves it?',
  'Java',
  'Object Oriented Programming',
  ARRAY['OOP', 'Java', 'Polymorphism', 'Foundations'],
  FALSE,
  'solved',
  142,
  18,
  0,
  '${vecQ1}'::vector,
  ARRAY['${Q2}', '${Q3}']::uuid[]
),
(
  '${Q2}',
  '${U4}',
  'Runtime vs compile-time polymorphism in Java',
  'What is the fundamental difference between method overloading (compile-time) and method overriding (runtime) in Java? When does dynamic method dispatch occur?',
  'Java',
  'Method Overriding & Dispatch',
  ARRAY['Java', 'Polymorphism', 'Overloading', 'Overriding'],
  FALSE,
  'solved',
  98,
  12,
  0,
  '${vecQ2}'::vector,
  ARRAY['${Q1}']::uuid[]
),
(
  '${Q3}',
  '${U1}',
  'Examples of polymorphism in Java with practical code',
  'I understand the theoretical definition, but could someone provide a real-world code example such as a Shape or PaymentGateway hierarchy demonstrating dynamic binding?',
  'Java',
  'Practical Examples',
  ARRAY['Java', 'OOP', 'CodeExample'],
  TRUE,
  'open',
  45,
  5,
  0,
  '${vecQ3}'::vector,
  ARRAY['${Q1}', '${Q2}']::uuid[]
),
(
  '${Q4}',
  '${U4}',
  'Why is Binary Search time complexity O(log n) instead of O(n)?',
  'Can someone provide a mathematical and intuitive breakdown of why dividing the search space in half each iteration leads to logarithmic time?',
  'Data Structures',
  'Search Algorithms',
  ARRAY['Algorithms', 'BinarySearch', 'Complexity', 'DSA'],
  FALSE,
  'solved',
  230,
  34,
  0,
  '${vecQ4}'::vector,
  '{}'::uuid[]
),
(
  '${Q5}',
  '${U1}',
  'Difference between Process and Thread in Operating Systems',
  'Why are threads often called lightweight processes? What memory segments do threads share versus what segments are unique to each thread?',
  'Operating Systems',
  'Process Management',
  ARRAY['OS', 'Process', 'Threads', 'Concurrency'],
  FALSE,
  'solved',
  189,
  27,
  0,
  '${vecQ5}'::vector,
  '{}'::uuid[]
),
(
  '${Q6}',
  '${U4}',
  'How does Database Normalization (1NF, 2NF, 3NF) reduce redundancy?',
  'In DBMS, what are the exact conditions for 2NF and 3NF, and what is the difference between partial dependency and transitive dependency?',
  'DBMS',
  'Relational Design',
  ARRAY['DBMS', 'SQL', 'Normalization', 'Database'],
  FALSE,
  'open',
  76,
  8,
  0,
  '${vecQ6}'::vector,
  '{}'::uuid[]
),
(
  '${Q7}',
  '${U1}',
  'Explain TCP 3-Way Handshake step by step with SYN and ACK flags',
  'How do client and server establish a reliable connection? What happens if the third ACK packet is lost in transit?',
  'Computer Networks',
  'Transport Layer',
  ARRAY['Networks', 'TCP', 'Handshake', 'Protocols'],
  FALSE,
  'solved',
  160,
  22,
  0,
  '${vecQ7}'::vector,
  '{}'::uuid[]
),
(
  '${Q8}',
  '${U4}',
  'What is virtual memory and how does paging prevent external fragmentation?',
  'How does the MMU translate virtual page numbers to physical frame numbers using page tables and TLB?',
  'Operating Systems',
  'Memory Management',
  ARRAY['OS', 'VirtualMemory', 'Paging', 'TLB'],
  TRUE,
  'open',
  53,
  7,
  0,
  '${vecQ8}'::vector,
  '{}'::uuid[]
)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Answers
INSERT INTO answers (id, question_id, user_id, content, is_anonymous, ai_status, ai_feedback, is_accepted, upvote_count, downvote_count, report_count) VALUES
(
  '${A1}',
  '${Q1}',
  '${U2}',
  'Polymorphism comes from Greek words: "poly" (many) and "morph" (form). In Java, it allows an object to take on many forms. 

The two main types in Java are:
1. **Compile-time Polymorphism (Static Binding)**: Achieved through **Method Overloading** (same method name, different signatures). The compiler resolves the method to call based on parameter types at compile time.
2. **Runtime Polymorphism (Dynamic Binding)**: Achieved through **Method Overriding** (subclass provides specific implementation of a method defined in superclass). The JVM resolves the call at runtime based on the actual object instance on the heap (Dynamic Method Dispatch).

Example: A reference of type \`Animal a = new Dog(); a.makeSound();\` calls Dog''s \`makeSound\` method at runtime.',
  FALSE,
  'reviewed',
  'Accurate and comprehensive explanation of compile-time vs runtime polymorphism in Java. Clearly distinguishes method overloading from overriding and explains dynamic dispatch correctly.',
  TRUE,
  42,
  0,
  0
),
(
  '${A2}',
  '${Q2}',
  '${U3}',
  'The crucial difference is **when** the method binding happens:
- **Compile-time (Overloading)**: Resolved during compilation. Multiple methods in the same class have the same name but different parameter count/types. Return type alone does not distinguish overloads.
- **Runtime (Overriding)**: Resolved while the program runs. Subclass overrides a method of the parent class with identical name and parameter signature. Java uses the \`invokevirtual\` bytecode instruction and a virtual method table (vtable) to locate the correct method pointer at runtime based on the runtime type of the caller.',
  FALSE,
  'reviewed',
  'Clear breakdown of dispatch timing and vtable mechanism.',
  TRUE,
  28,
  0,
  0
),
(
  '${A3}',
  '${Q4}',
  '${U3}',
  'Imagine you have an array of size N = 16.
- In iteration 1, you check middle: remaining search space = 8 (N/2)
- Iteration 2: remaining = 4 (N/4)
- Iteration 3: remaining = 2 (N/8)
- Iteration 4: remaining = 1 (N/16)

In general, after k iterations, the remaining elements are N / (2^k).
The search terminates when the search space reduces to 1 element:
N / (2^k) = 1  ==>  2^k = N  ==>  k = log2(N).

Hence, Binary Search makes at most O(log n) comparisons on a sorted array.',
  FALSE,
  'reviewed',
  'Mathematically rigorous and intuitive derivation of logarithmic complexity.',
  TRUE,
  35,
  0,
  0
),
(
  '${A4}',
  '${Q5}',
  '${U2}',
  'Key differences:
1. **Memory & Address Space**: A process has its own dedicated address space (Code, Data, Heap, Stack). Threads within the same process **share** Code, Data, and Heap, but each thread has its own private **Stack and Program Counter (PC)**.
2. **Context Switching Overhead**: Context switching between processes requires saving MMU page tables, TLB flushes, and OS scheduler work. Thread context switching is much lighter because the address space remains identical.
3. **Communication**: Threads communicate easily through shared memory. Processes require IPC mechanisms (pipes, sockets, message queues).',
  FALSE,
  'reviewed',
  'Clear, precise breakdown of shared vs private thread memory and context-switching overhead.',
  TRUE,
  31,
  0,
  0
),
(
  '${A5}',
  '${Q7}',
  '${U2}',
  'TCP 3-Way Handshake establishes synchronized sequence numbers between client and server:

1. **Step 1 (SYN)**: Client sends a segment with \`SYN = 1\` and a randomly generated Initial Sequence Number (\`seq = ISN_client\`). State: \`SYN_SENT\`.
2. **Step 2 (SYN-ACK)**: Server responds with \`SYN = 1, ACK = 1\`, acknowledging client sequence (\`ack = ISN_client + 1\`) and proposing its own sequence (\`seq = ISN_server\`). State: \`SYN_RECEIVED\`.
3. **Step 3 (ACK)**: Client responds with \`ACK = 1\` and \`ack = ISN_server + 1\`. Connection is now \`ESTABLISHED\`.

If the 3rd ACK is lost, the server retransmits the SYN-ACK after a timeout.',
  FALSE,
  'reviewed',
  'Factual and complete breakdown of TCP handshake flags, sequence numbers, and packet loss recovery.',
  TRUE,
  24,
  0,
  0
),
(
  '${A6}',
  '${Q4}',
  '${U1}',
  'Binary search checks the array elements one by one from left to right until the target is found, which takes O(n) linear steps in the worst case.',
  FALSE,
  'potential_issue',
  'The answer confuses Binary Search with Linear Search. Binary Search requires a sorted array and operates by halving the search space, giving O(log n) time complexity, not O(n).',
  FALSE,
  1,
  6,
  3
)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Comments
INSERT INTO comments (id, answer_id, user_id, content) VALUES
('c0000001-0000-0000-0000-000000000001', '${A1}', '${U4}', 'This makes total sense now! Does Java support multiple inheritance with polymorphism?'),
('c0000002-0000-0000-0000-000000000002', '${A1}', '${U2}', 'Great question! Through interfaces, yes — a class can implement multiple interfaces and be treated polymorphically as any of those types.'),
('c0000003-0000-0000-0000-000000000003', '${A6}', '${U3}', 'Note: this describes linear search, not binary search.')
ON CONFLICT (id) DO NOTHING;
`;

fs.writeFileSync(path.join(__dirname, 'seed.sql'), seedSql, 'utf-8');
console.log('Successfully generated seed.sql with precomputed 768-dim embeddings!');

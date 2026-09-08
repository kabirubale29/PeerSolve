async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
    assert(healthRes.status === 'ok', 'GET /api/health returns status ok');

    // 2. Fetch questions
    const qRes = await fetch(`${baseUrl}/questions`).then(r => r.json());
    assert(Array.isArray(qRes.questions) && qRes.questions.length > 0, 'GET /api/questions returns questions array');

    // 3. Similar questions search
    const simRes = await fetch(`${baseUrl}/ai/similar-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is polymorphism in Java?' })
    }).then(r => r.json());
    assert(Array.isArray(simRes.matches) && simRes.matches.length > 0, 'POST /api/ai/similar-questions returns matches');
    assert(simRes.matches.some(m => m.status === 'solved'), 'Similar questions include Solved/Open status indicators');

    // 4. Test self-voting rejection (User 'a1111111-1111-1111-1111-111111111111' owns Q1)
    const selfVoteRes = await fetch(`${baseUrl}/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-user-id': 'a1111111-1111-1111-1111-111111111111'
      },
      body: JSON.stringify({
        target_type: 'question',
        target_id: '11111111-1111-1111-1111-111111111111',
        vote_type: 'up'
      })
    });
    assert(selfVoteRes.status === 400, 'POST /api/votes prevents users from voting on their own question (returns 400)');

    // 5. Test legitimate vote from different user (Priya voting on Rahul's Q1)
    const legitVoteRes = await fetch(`${baseUrl}/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-user-id': 'b2222222-2222-2222-2222-222222222222'
      },
      body: JSON.stringify({
        target_type: 'question',
        target_id: '11111111-1111-1111-1111-111111111111',
        vote_type: 'up'
      })
    });
    assert(legitVoteRes.status === 200, 'POST /api/votes allows peer upvote');

    // 6. Test self-accept answer rejection
    // If a user creates a question and answers it, they cannot accept their own answer
    const selfAcceptRes = await fetch(`${baseUrl}/answers/dddddddd-dddd-dddd-dddd-dddddddddddd/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-user-id': 'a1111111-1111-1111-1111-111111111111'
      }
    });
    assert(selfAcceptRes.status === 400 || selfAcceptRes.status === 403, 'POST /api/answers/:id/accept prevents self-accepting own answer');

    // 7. Test anonymous author masking in public API
    // Q3 was posted anonymously by Rahul. A different user (Priya) fetches questions:
    const anonCheckRes = await fetch(`${baseUrl}/questions`, {
      headers: { 'x-demo-user-id': 'b2222222-2222-2222-2222-222222222222' }
    }).then(r => r.json());
    const q3 = anonCheckRes.questions.find(q => q.id === '33333333-3333-3333-3333-333333333333');
    assert(q3 && q3.author.name === 'Anonymous Student', 'Anonymous doubt author name is masked to "Anonymous Student"');
    assert(q3 && !q3.author.id, 'Anonymous doubt author id is completely stripped from public response');
    assert(q3 && q3.author.role === 'junior', 'Role tag (Junior) is preserved for trust without revealing identity');

    // 8. Test notifications mark as read
    const notifs = await fetch(`${baseUrl}/notifications`, {
      headers: { 'x-demo-user-id': 'b2222222-2222-2222-2222-222222222222' }
    }).then(r => r.json());
    assert(Array.isArray(notifs.notifications), 'GET /api/notifications returns user notifications');

    const markAllRes = await fetch(`${baseUrl}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'x-demo-user-id': 'b2222222-2222-2222-2222-222222222222' }
    }).then(r => r.json());
    assert(markAllRes.success === true, 'PATCH /api/notifications/read-all successfully marks all as read');

    console.log(`\n================================`);
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`================================`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();

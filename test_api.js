async function testAIEndpoints() {
  console.log('--- 1. Testing /api/ai/assistant-chat ---');
  try {
    const res = await fetch('http://localhost:5000/api/ai/assistant-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userQuery: 'How does quicksort partition work?' })
    });
    const data = await res.json();
    console.log('Chat Status:', res.status);
    console.log('AI Reply Preview:', data.reply ? data.reply.slice(0, 150) + '...' : data);
    console.log('Suggested Question Title:', data.suggestedQuestion?.title);
  } catch (e) {
    console.error('Chat error:', e);
  }

  console.log('\n--- 2. Testing /api/ai/improve-question ---');
  try {
    const res = await fetch('http://localhost:5000/api/ai/improve-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'java recursion stack overflow',
        description: 'why does my recursive function crash with stack overflow error',
        subject: 'Java'
      })
    });
    const data = await res.json();
    console.log('Improve Status:', res.status);
    console.log('Improved Title:', data.data?.improvedTitle);
    console.log('Suggested Tags:', data.data?.suggestedTags);
  } catch (e) {
    console.error('Improve error:', e);
  }

  console.log('\n--- 3. Testing /api/ai/verify-answer ---');
  try {
    const res = await fetch('http://localhost:5000/api/ai/verify-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionTitle: 'What is the time complexity of Binary Search?',
        questionDescription: 'Searching in a sorted array of size n',
        answerContent: 'Binary search takes O(log n) time because in each step the search space is halved.'
      })
    });
    const data = await res.json();
    console.log('Verify Status:', res.status);
    console.log('AI Status:', data.status);
    console.log('AI Feedback:', data.feedback);
  } catch (e) {
    console.error('Verify error:', e);
  }
}

testAIEndpoints();






import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG, SUBJECTS } from '../config/constants.js';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
export const isGeminiConfigured = !!apiKey && apiKey !== 'your_gemini_api_key_here';

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;

// Timeout wrapper helper
function withTimeout(promise, ms = AI_CONFIG.TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);
}

/**
 * Generate 768-dimensional embedding for semantic search
 */
export async function generateEmbedding(text) {
  if (!isGeminiConfigured) {
    return generateDeterministicEmbedding(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: AI_CONFIG.EMBEDDING_MODEL });
    const result = await withTimeout(
      model.embedContent(text.slice(0, 2048)),
      AI_CONFIG.TIMEOUT_MS
    );
    const values = result.embedding.values;
    return values;
  } catch (err) {
    console.warn('Gemini embedding failed or timed out, using fallback vector:', err.message);
    return generateDeterministicEmbedding(text);
  }
}

/**
 * Deterministic fallback embedding generator (768-dim unit vector)
 */
function generateDeterministicEmbedding(text) {
  const dim = 768;
  const vec = new Float32Array(dim);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  let norm = 0;
  for (let i = 0; i < dim; i++) {
    const val = Math.sin((i + 1) * hash * 0.013);
    vec[i] = val;
    norm += val * val;
  }
  norm = Math.sqrt(norm);
  const result = [];
  for (let i = 0; i < dim; i++) {
    result.push(vec[i] / norm);
  }
  return result;
}

/**
 * AI Answer Verification (Advisory, never blocking)
 * Analyzes factual correctness, logic, relevance, missing edge cases.
 */
export async function verifyAnswer(questionTitle, questionDesc, answerContent) {
  if (!isGeminiConfigured) {
    return {
      status: 'unavailable',
      feedback: 'AI review is temporarily unavailable. Your answer has still been saved.'
    };
  }

  const prompt = `You are an academic doubt verification assistant for PeerSolve.
Analyze the following student answer to an academic question.
Advisory guidelines:
1. Check for factual correctness, logical consistency, and clarity.
2. If there are obvious errors or misleading statements (e.g. confusing O(n) with O(log n)), classify as "potential_issue".
3. If it is mostly correct but lacks an important distinction or edge case, classify as "needs_review".
4. If it is accurate, well-reasoned, or helpful, classify as "reviewed".

Question Title: "${questionTitle}"
Question Description: "${questionDesc}"
Submitted Answer: "${answerContent}"

Return ONLY valid JSON in this exact structure without markdown or backticks:
{
  "status": "reviewed" | "needs_review" | "potential_issue",
  "feedback": "Concise, friendly, 1-3 sentence explanation of the assessment."
}`;

  try {
    const model = genAI.getGenerativeModel({ model: AI_CONFIG.MODEL_NAME });
    const response = await withTimeout(
      model.generateContent(prompt),
      AI_CONFIG.TIMEOUT_MS
    );
    const text = response.response.text().trim();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    // Validate status
    const validStatuses = ['reviewed', 'needs_review', 'potential_issue'];
    const status = validStatuses.includes(parsed.status) ? parsed.status : 'reviewed';
    return {
      status,
      feedback: parsed.feedback || 'Answer reviewed by AI.'
    };
  } catch (err) {
    console.warn('Gemini verifyAnswer error:', err.message);
    return {
      status: 'unavailable',
      feedback: 'AI review is temporarily unavailable. Your answer has still been saved.'
    };
  }
}

/**
 * AI Question Improvement
 * Proposes polished title, structured description, subject category, and tags.
 */
export async function improveQuestion(title, description, subject, tags) {
  if (!isGeminiConfigured) {
    return {
      success: false,
      message: 'AI assistant is temporarily unavailable.'
    };
  }

  const prompt = `You are an academic mentor for university students on PeerSolve.
The student drafted the following question:
Current Title: "${title}"
Current Description: "${description}"
Current Subject: "${subject || ''}"
Current Tags: "${(tags || []).join(', ')}"

Available subjects: ${SUBJECTS.join(', ')}

Please refine this question so it is clear, searchable, and reusable for peers:
1. Improved Title: Concise, direct, academic.
2. Improved Description: Clear breakdown of the doubt, context, and expected clarification.
3. Suggested Subject: Exactly one from the available subjects list.
4. Suggested Tags: 2 to 4 relevant tags (e.g. ["Java", "OOP", "Polymorphism"]).

Return ONLY valid JSON in this exact format without backticks:
{
  "improvedTitle": "...",
  "improvedDescription": "...",
  "suggestedSubject": "...",
  "suggestedTags": ["...", "..."]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: AI_CONFIG.MODEL_NAME });
    const response = await withTimeout(
      model.generateContent(prompt),
      AI_CONFIG.TIMEOUT_MS
    );
    const text = response.response.text().trim();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      success: true,
      data: parsed
    };
  } catch (err) {
    console.warn('Gemini improveQuestion error:', err.message);
    return {
      success: false,
      message: 'Unable to improve question at this time. You can still post as is.'
    };
  }
}

/**
 * AI Personal Assistant Chat
 * Academic doubt solving with structured post-to-forum metadata.
 */
export async function assistantChat(conversationHistory, userQuery) {
  if (!isGeminiConfigured) {
    return {
      reply: "Hello! I am PeerSolve's Academic AI Assistant. Gemini API is currently in demo mode. Please set GEMINI_API_KEY in your server .env file to enable live AI responses.",
      suggestedQuestion: null
    };
  }

  const prompt = `You are PeerSolve AI, an encouraging and rigorous academic assistant for university students.
The student has an academic doubt. Provide a clear, thorough explanation with examples or code if applicable.

Also, extract a forum question draft so the user can easily share this doubt to the community forum if they want.
Available subjects: ${SUBJECTS.join(', ')}

Student Query: "${userQuery}"

Return ONLY valid JSON without backticks in this format:
{
  "reply": "Your clear, markdown-friendly response explaining the concept.",
  "suggestedQuestion": {
    "title": "A concise searchable forum title",
    "description": "Refined context and explanation of the doubt for peer review",
    "subject": "One of the available subjects",
    "tags": ["tag1", "tag2", "tag3"]
  }
}`;

  try {
    const model = genAI.getGenerativeModel({ model: AI_CONFIG.MODEL_NAME });
    const response = await withTimeout(
      model.generateContent(prompt),
      AI_CONFIG.TIMEOUT_MS
    );
    const text = response.response.text().trim();
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (err) {
    console.warn('Gemini assistantChat error:', err.message);
    return {
      reply: "I'm having trouble connecting to the AI service right now. You can still ask your question directly on the community forum!",
      suggestedQuestion: {
        title: userQuery.slice(0, 80),
        description: userQuery,
        subject: 'Other',
        tags: ['General']
      }
    };
  }
}

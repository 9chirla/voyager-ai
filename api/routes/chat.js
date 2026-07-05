import { Router } from 'express';
import OpenAI from 'openai';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** @type {OpenAI | null} */
let client = null;

/**
 * Lazily create the OpenAI client so dotenv has loaded before the key is read.
 * ESM evaluates route imports before server.js runs dotenv.config().
 * @returns {OpenAI}
 */
function getClient() {
  if (!client) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }
    client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey,
    });
  }
  return client;
}

const OUTPUT_MAX_TOKENS = 8192;
const MAX_CONTINUATIONS = 10;
/** Tail of prior output sent back on auto-continue. */
const CONTINUE_CONTEXT_CHARS = 12000;

const CONTINUE_PROMPT =
  'Your previous response was cut off by a length limit. Continue EXACTLY where you stopped — '
  + 'mid-sentence if needed. Rules:\n'
  + '- Output ONLY new text; do not repeat anything already written.\n'
  + '- Keep the exact format: DAY N | Location: Theme, then Morning/Afternoon/Evening lines each ending with "Why today: [reason]".\n'
  + '- After itinerary: ##CHECKLIST_START## … ##CHECKLIST_END##, then ##INSIDER_TIPS_START## … ##INSIDER_TIPS_END## (tips must NOT repeat the itinerary).\n'
  + '- Use clear, grammatical English — complete sentences only, no fragments.\n'
  + '- Finish all remaining itinerary days, then the checklist block, insider tips, and ##STAGE##5##END_STAGE##.';

/**
 * Trim to a clean continuation anchor (sentence or day boundary, not mid-word).
 * @param {string} text
 * @param {number} maxChars
 * @returns {string}
 */
function trimForContinue(text, maxChars) {
  if (text.length <= maxChars) return text;

  let tail = text.slice(-maxChars);
  const dayBreak = tail.search(/\n\s*DAY\s+\d+/i);
  if (dayBreak > 0) tail = tail.slice(dayBreak + 1);

  const sentenceBreak = tail.search(/[.!?]\s+(?=[A-Z#-])/);
  if (sentenceBreak > 0 && sentenceBreak < tail.length - 40) {
    tail = tail.slice(sentenceBreak + 2);
  }

  return tail.trimStart();
}

/**
 * Map DeepSeek API errors to HTTP status codes and user-facing messages.
 * @param {Error} err
 * @returns {{ status: number, error: string }}
 */
function mapApiError(err) {
  const status = err.status || err.response?.status;
  if (status === 402) {
    return {
      status: 402,
      error: 'Your DeepSeek account has insufficient balance. Add credits at platform.deepseek.com',
    };
  }
  if (status === 401) {
    return {
      status: 401,
      error: 'Invalid API key. Check DEEPSEEK_API_KEY in your .env file',
    };
  }
  if (status === 429) {
    return {
      status: 429,
      error: 'Rate limit reached. Please wait a moment and try again',
    };
  }
  return { status: 500, error: 'Something went wrong' };
}

const router = Router();

/**
 * POST /api/chat — streaming proxy to DeepSeek Chat API (SSE).
 * @body {{ messages: Array<{role: string, content: string}>, stage?: number }}
 */
router.post('/chat', limiter, async (req, res) => {
  const { messages } = req.body;

  if (!process.env.DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY is not configured' });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  if (messages.length > 30) {
    return res.status(400).json({ error: 'Too many messages (max 30)' });
  }

  const validRoles = new Set(['user', 'assistant', 'system']);
  for (const msg of messages) {
    if (!validRoles.has(msg.role)) {
      return res.status(400).json({ error: `Invalid role: ${msg.role}` });
    }
    if (typeof msg.content !== 'string' || msg.content.trim().length === 0) {
      return res.status(400).json({ error: 'Each message must have non-empty string content' });
    }
  }

  /** @type {Array<{role: string, content: string}>} */
  const originalMessages = messages;

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    /** @type {Array<{role: string, content: string}>} */
    let conversation = originalMessages;
    let finishReason = null;
    let accumulatedText = '';

    for (let attempt = 0; attempt <= MAX_CONTINUATIONS; attempt++) {
      const stream = await getClient().chat.completions.create({
        model: 'deepseek-chat',
        messages: conversation,
        max_tokens: OUTPUT_MAX_TOKENS,
        temperature: attempt === 0 ? 0.9 : 0.4,
        stream: true,
      });

      let assistantPart = '';
      finishReason = null;

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        const token = choice?.delta?.content || '';
        if (token) {
          assistantPart += token;
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
        if (choice?.finish_reason) {
          finishReason = choice.finish_reason;
        }
      }

      accumulatedText += assistantPart;

      if (finishReason !== 'length' || attempt === MAX_CONTINUATIONS) {
        break;
      }

      conversation = [
        ...originalMessages,
        { role: 'assistant', content: trimForContinue(accumulatedText, CONTINUE_CONTEXT_CHARS) },
        { role: 'user', content: CONTINUE_PROMPT },
      ];
    }

    if (finishReason) {
      res.write(`data: ${JSON.stringify({ meta: { finish_reason: finishReason } })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('DeepSeek API error:', err.message);

    if (!res.headersSent) {
      const { status, error } = mapApiError(err);
      return res.status(status).json({ error });
    }

    res.end();
  }
});

export default router;

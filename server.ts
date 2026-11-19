import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  getLast24HoursNews,
  getSubscriberCount,
  pollPriorityTelegramChannels,
  subscribeToLiveNews,
} from './serverNews.ts';
import { getRecentFootballMatches } from './serverMatches.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const aiBeta = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const aiAlpha = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      apiVersion: 'v1alpha',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

interface CachedAudio {
  audioBase64: string;
  mimeType: string;
}

const ttsCache = new Map<string, CachedAudio>();
const MAX_CACHE_ENTRIES = 120;

function setCache(key: string, value: CachedAudio) {
  if (ttsCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = ttsCache.keys().next().value;
    if (oldestKey) ttsCache.delete(oldestKey);
  }
  ttsCache.set(key, value);
}

async function synthesizeWithGemini(text: string): Promise<CachedAudio> {
  if (!aiBeta || !aiAlpha) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const attempts: Array<() => Promise<CachedAudio | null>> = [
    async () => {
      const response = await aiAlpha.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text,
                speechMetadata: {
                  style: 'Clear, warm, articulate female Arabic news anchor',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      const part = (response.candidates?.[0]?.content?.parts ?? []).find((p) => p.inlineData?.data);
      if (!part?.inlineData?.data) return null;
      return {
        audioBase64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'audio/wav',
      };
    },
    async () => {
      const response = await aiBeta.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: `اقرئي هذا النص الإخباري بصوت أنثوي واضح وهادئ: ${text}`,
        config: {
          responseModalities: ['AUDIO'],
        },
      });
      const part = (response.candidates?.[0]?.content?.parts ?? []).find((p) => p.inlineData?.data);
      if (!part?.inlineData?.data) return null;
      return {
        audioBase64: part.inlineData.data,
        mimeType: part.inlineData.mimeType || 'audio/wav',
      };
    },
  ];

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result) return result;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('TTS_SYNTHESIS_FAILED');
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  let livePoller: ReturnType<typeof setInterval> | null = null;
  let telegramPoller: ReturnType<typeof setInterval> | null = null;
  const stopPollersIfIdle = () => {
    if (getSubscriberCount() === 0) {
      if (livePoller) {
        clearInterval(livePoller);
        livePoller = null;
      }
      if (telegramPoller) {
        clearInterval(telegramPoller);
        telegramPoller = null;
      }
    }
  };
  const ensureLivePoller = () => {
    if (!livePoller) {
      livePoller = setInterval(() => {
        if (getSubscriberCount() === 0) {
          stopPollersIfIdle();
          return;
        }
        void getLast24HoursNews(true).catch(() => undefined);
      }, 25_000);
    }
    if (!telegramPoller) {
      telegramPoller = setInterval(() => {
        if (getSubscriberCount() === 0) {
          stopPollersIfIdle();
          return;
        }
        void pollPriorityTelegramChannels().catch(() => undefined);
      }, 10_000);
    }
  };

  app.get('/api/sports/matches', async (req, res) => {
    try {
      const force = req.query.force === '1';
      const data = await getRecentFootballMatches(force);
      res.json({
        matches: data.matches,
        total: data.matches.length,
        fetchedAt: data.fetchedAt,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر جلب نتائج المباريات';
      console.error('Matches fetch error:', message);
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/news', async (req, res) => {
    try {
      const force = req.query.force === '1';
      const data = await getLast24HoursNews(force);
      res.json({
        articles: data.articles,
        total: data.articles.length,
        fetchedAt: data.fetchedAt,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر جلب الأخبار من المصادر';
      console.error('News aggregation error:', message);
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/news/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

    const unsubscribe = subscribeToLiveNews(({ newArticles, fetchedAt }) => {
      if (newArticles.length > 0) {
        res.write(
          `event: new_articles\ndata: ${JSON.stringify({
            newArticles,
            fetchedAt,
          })}\n\n`
        );
      }
    });

    ensureLivePoller();
    const heartbeat = setInterval(() => {
      res.write(': ping\n\n');
    }, 20_000);

    req.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
      stopPollersIfIdle();
    });
  });

  app.post('/api/tts', async (req, res) => {
    const rawText = typeof req.body?.text === 'string' ? req.body.text : '';
    const text = rawText.replace(/\s+/g, ' ').trim();

    if (!text) {
      res.status(400).json({ error: 'النص مطلوب لتحويله إلى صوت' });
      return;
    }

    if (text.length > 900) {
      res.status(400).json({ error: 'النص أطول من الحد المسموح للفقرة الصوتية' });
      return;
    }

    const cached = ttsCache.get(text);
    if (cached) {
      res.json(cached);
      return;
    }

    try {
      const payload = await synthesizeWithGemini(text);
      setCache(text, payload);
      res.json(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر توليد الصوت';
      console.error('TTS error:', message);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

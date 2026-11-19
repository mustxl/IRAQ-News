import { GoogleGenAI } from '@google/genai';

interface VercelReq {
  method?: string;
  body?: { text?: unknown } | string;
}

interface VercelRes {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
}

interface CachedAudio {
  audioBase64: string;
  mimeType: string;
}

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

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let parsedBody: { text?: unknown } = {};
  if (typeof req.body === 'string') {
    try {
      parsedBody = JSON.parse(req.body) as { text?: unknown };
    } catch {
      parsedBody = {};
    }
  } else if (req.body && typeof req.body === 'object') {
    parsedBody = req.body;
  }

  const rawText = typeof parsedBody.text === 'string' ? parsedBody.text : '';
  const text = rawText.replace(/\s+/g, ' ').trim();

  if (!text) {
    res.status(400).json({ error: 'النص مطلوب لتحويله إلى صوت' });
    return;
  }

  if (text.length > 900) {
    res.status(400).json({ error: 'النص أطول من الحد المسموح للفقرة الصوتية' });
    return;
  }

  try {
    const payload = await synthesizeWithGemini(text);
    res.status(200).json(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'تعذر توليد الصوت';
    console.error('Vercel TTS error:', message);
    res.status(500).json({ error: message });
  }
}

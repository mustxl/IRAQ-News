import { getLast24HoursNews } from '../serverNews.js';

interface VercelReq {
  method?: string;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface VercelRes {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const queryForce = req.query?.force;
    const urlForce = req.url
      ? new URL(req.url, 'http://localhost').searchParams.get('force')
      : null;
    const force = queryForce === '1' || urlForce === '1';

    const data = await getLast24HoursNews(force);
    res.setHeader('Cache-Control', force ? 'no-store' : 's-maxage=20, stale-while-revalidate=40');
    res.status(200).json({
      articles: data.articles,
      total: data.articles.length,
      fetchedAt: data.fetchedAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'تعذر جلب الأخبار من المصادر';
    console.error('Vercel news fetch error:', message);
    res.status(500).json({ error: message });
  }
}

import type { FootballMatch } from './src/types/news.ts';

const CACHE_TTL_MS = 30 * 1000;

interface ScoreboardFeed {
  slug: string;
  arabicLeague?: string;
  priority: number;
}

const SCOREBOARD_FEEDS: ScoreboardFeed[] = [
  { slug: 'uefa.champions', arabicLeague: 'دوري أبطال أوروبا', priority: 10 },
  { slug: 'uefa.nations', arabicLeague: 'دوري الأمم الأوروبية', priority: 9 },
  { slug: 'fifa.worldq.afc', arabicLeague: 'تصفيات كأس العالم · آسيا', priority: 10 },
  { slug: 'fifa.worldq.uefa', arabicLeague: 'تصفيات كأس العالم · أوروبا', priority: 9 },
  { slug: 'eng.1', arabicLeague: 'الدوري الإنجليزي', priority: 9 },
  { slug: 'esp.1', arabicLeague: 'الدوري الإسباني', priority: 9 },
  { slug: 'ita.1', arabicLeague: 'الدوري الإيطالي', priority: 8 },
  { slug: 'ger.1', arabicLeague: 'الدوري الألماني', priority: 8 },
  { slug: 'fra.1', arabicLeague: 'الدوري الفرنسي', priority: 8 },
  { slug: 'ksa.1', arabicLeague: 'الدوري السعودي', priority: 9 },
  { slug: 'fifa.friendly', arabicLeague: 'مباراة ودية دولية', priority: 7 },
  { slug: 'all', priority: 5 },
];

const TEAM_ARABIC_MAP: Record<string, string> = {
  'Real Madrid': 'ريال مدريد',
  Barcelona: 'برشلونة',
  'Atletico Madrid': 'أتلتيكو مدريد',
  'Manchester City': 'مانشستر سيتي',
  'Manchester United': 'مانشستر يونايتد',
  Liverpool: 'ليفربول',
  Arsenal: 'أرسنال',
  Chelsea: 'تشيلسي',
  'Tottenham Hotspur': 'توتنهام',
  'Paris Saint-Germain': 'باريس سان جيرمان',
  'Bayern Munich': 'بايرن ميونخ',
  'Borussia Dortmund': 'بوروسيا دورتموند',
  Internazionale: 'إنتر ميلان',
  'Inter Milan': 'إنتر ميلان',
  'AC Milan': 'ميلان',
  Juventus: 'يوفنتوس',
  Napoli: 'نابولي',
  'AS Roma': 'روما',
  Iraq: 'العراق',
  'United Arab Emirates': 'الإمارات',
  'Saudi Arabia': 'السعودية',
  Qatar: 'قطر',
  Jordan: 'الأردن',
  Kuwait: 'الكويت',
  Oman: 'عُمان',
  Bahrain: 'البحرين',
  Egypt: 'مصر',
  Morocco: 'المغرب',
  Algeria: 'الجزائر',
  Tunisia: 'تونس',
  Yemen: 'اليمن',
  Syria: 'سوريا',
  Lebanon: 'لبنان',
  Palestine: 'فلسطين',
  Brazil: 'البرازيل',
  Argentina: 'الأرجنتين',
  France: 'فرنسا',
  Spain: 'إسبانيا',
  England: 'إنجلترا',
  Germany: 'ألمانيا',
  Italy: 'إيطاليا',
  Portugal: 'البرتغال',
  Netherlands: 'هولندا',
  Belgium: 'بلجيكا',
  Croatia: 'كرواتيا',
  Denmark: 'الدنمارك',
  Norway: 'النرويج',
  Sweden: 'السويد',
  Switzerland: 'سويسرا',
  Austria: 'النمسا',
  Poland: 'بولندا',
  Turkey: 'تركيا',
  Türkiye: 'تركيا',
  Romania: 'رومانيا',
  Hungary: 'المجر',
  'Bosnia-Herzegovina': 'البوسنة والهرسك',
  'Northern Ireland': 'أيرلندا الشمالية',
  Scotland: 'اسكتلندا',
  Ukraine: 'أوكرانيا',
  Serbia: 'صربيا',
  Greece: 'اليونان',
  Japan: 'اليابان',
  'South Korea': 'كوريا الجنوبية',
  Iran: 'إيران',
  Australia: 'أستراليا',
  Uzbekistan: 'أوزبكستان',
  Malaysia: 'ماليزيا',
  Singapore: 'سنغافورة',
  Indonesia: 'إندونيسيا',
  'Al Hilal': 'الهلال',
  'Al Nassr': 'النصر',
  'Al Ahli': 'الأهلي',
  'Al Ittihad': 'الاتحاد',
  'Man City': 'مانشستر سيتي',
  'Man Utd': 'مانشستر يونايتد',
  PSG: 'باريس سان جيرمان',
  Everton: 'إيفرتون',
  Brighton: 'برايتون',
  Valencia: 'فالنسيا',
  'London City': 'لندن سيتي',
  Mallorca: 'مايوركا',
  Tenerife: 'تينيريفي',
  'BK Häcken': 'هاكن',
  'OH Leuven': 'لوفين',
};

function translateTeam(name: string): string {
  const clean = name.trim();
  return TEAM_ARABIC_MAP[clean] ?? clean;
}

function translateLeague(rawName: string, slug: string): string {
  const s = `${rawName} ${slug}`.toLowerCase();
  if (s.includes('champions')) return 'دوري أبطال أوروبا';
  if (s.includes('nations')) return 'دوري الأمم الأوروبية';
  if (s.includes('friendly')) return 'مباراة ودية دولية';
  if (s.includes('worldq') || s.includes('qualifying')) return 'تصفيات كأس العالم';
  if (s.includes('english premier') || s.includes('eng.1')) return 'الدوري الإنجليزي';
  if (s.includes('laliga') || s.includes('esp.1')) return 'الدوري الإسباني';
  if (s.includes('serie a') || s.includes('ita.1')) return 'الدوري الإيطالي';
  if (s.includes('bundesliga') || s.includes('ger.1')) return 'الدوري الألماني';
  if (s.includes('ligue 1') || s.includes('fra.1')) return 'الدوري الفرنسي';
  if (s.includes('saudi') || s.includes('ksa.1')) return 'الدوري السعودي';
  if (s.includes('copa del rey') || s.includes('first-round') || s.includes('third-round')) return 'كأس ملك إسبانيا';
  if (s.includes('clausura') || s.includes('apertura')) return 'دوري أمريكا اللاتينية';
  if (s.includes('league-phase')) return 'بطولة أوروبية';
  return rawName || 'مباراة كرة قدم';
}

function translateStatus(state: 'in' | 'post' | 'pre', detail: string, dateStr: string): string {
  const d = (detail || '').trim();
  if (state === 'in') {
    if (d === 'HT') return 'مباشر · استراحة';
    return d ? `مباشر · ${d}` : 'جارية الآن';
  }
  if (state === 'post') {
    if (d === 'FT-Pens') return 'انتهت · ترجيح';
    if (d === 'AET') return 'انتهت · إضافي';
    const ms = Date.parse(dateStr);
    if (Number.isFinite(ms)) {
      const diffHours = Math.floor((Date.now() - ms) / 3600000);
      if (diffHours < 24) return 'انتهت اليوم';
      if (diffHours < 48) return 'انتهت أمس';
    }
    return 'انتهت';
  }
  return 'قريباً';
}

let cachedMatches: { matches: FootballMatch[]; fetchedAt: number } | null = null;
let inFlightMatches: Promise<FootballMatch[]> | null = null;

export async function getRecentFootballMatches(forceRefresh = false): Promise<{
  matches: FootballMatch[];
  fetchedAt: number;
}> {
  const now = Date.now();
  if (!forceRefresh && cachedMatches && now - cachedMatches.fetchedAt < CACHE_TTL_MS) {
    return cachedMatches;
  }

  if (inFlightMatches && !forceRefresh) {
    const matches = await inFlightMatches;
    return { matches, fetchedAt: cachedMatches?.fetchedAt ?? now };
  }

  inFlightMatches = (async () => {
    const byId = new Map<string, { match: FootballMatch; priority: number; ts: number }>();

    const settled = await Promise.allSettled(
      SCOREBOARD_FEEDS.map(async (feed) => {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${feed.slug}/scoreboard`,
          {
            signal: AbortSignal.timeout(5000),
            headers: { Accept: 'application/json' },
          }
        );
        if (!res.ok) return null;
        const json = (await res.json()) as {
          leagues?: Array<{ name?: string; slug?: string }>;
          events?: Array<{
            id?: string;
            date?: string;
            season?: { slug?: string };
            status?: { type?: { state?: string; shortDetail?: string } };
            competitions?: Array<{
              competitors?: Array<{
                homeAway?: string;
                score?: string;
                winner?: boolean;
                team?: { displayName?: string; shortDisplayName?: string; logo?: string };
              }>;
            }>;
          }>;
        };
        return { feed, json };
      })
    );

    for (const outcome of settled) {
      if (outcome.status !== 'fulfilled' || !outcome.value) continue;
      const { feed, json } = outcome.value;
      const rawLeagueName = json.leagues?.[0]?.name || '';
      const events = json.events ?? [];

      for (const ev of events) {
        if (!ev.id || !ev.date) continue;
        const rawState = ev.status?.type?.state;
        const state: 'in' | 'post' | 'pre' =
          rawState === 'in' ? 'in' : rawState === 'post' ? 'post' : 'pre';

        // Focus strictly on live and recently finished matches
        if (state === 'pre') continue;

        const ts = Date.parse(ev.date);
        // Skip very old archive fixtures (> 10 days old)
        if (Number.isFinite(ts) && now - ts > 10 * 24 * 60 * 60 * 1000) continue;

        const competitors = ev.competitions?.[0]?.competitors ?? [];
        if (competitors.length < 2) continue;

        const home = competitors.find((c) => c.homeAway === 'home') ?? competitors[0];
        const away = competitors.find((c) => c.homeAway === 'away') ?? competitors[1];

        const homeRaw = (home.team?.shortDisplayName || home.team?.displayName || '').trim();
        const awayRaw = (away.team?.shortDisplayName || away.team?.displayName || '').trim();
        if (!homeRaw || !awayRaw) continue;

        const homeScore = String(home.score ?? '0');
        const awayScore = String(away.score ?? '0');
        const hNum = Number(homeScore);
        const aNum = Number(awayScore);

        let winner: 'home' | 'away' | 'draw' | undefined;
        if (state === 'post') {
          if (home.winner || hNum > aNum) winner = 'home';
          else if (away.winner || aNum > hNum) winner = 'away';
          else winner = 'draw';
        }

        const leagueLabel =
          feed.arabicLeague ||
          translateLeague(rawLeagueName || ev.season?.slug || '', feed.slug);

        const match: FootballMatch = {
          id: ev.id,
          league: leagueLabel,
          date: ev.date,
          state,
          statusLabel: translateStatus(state, ev.status?.type?.shortDetail || '', ev.date),
          homeName: translateTeam(homeRaw),
          homeLogo: home.team?.logo || undefined,
          homeScore,
          awayName: translateTeam(awayRaw),
          awayLogo: away.team?.logo || undefined,
          awayScore,
          winner,
        };

        const existing = byId.get(ev.id);
        if (!existing || feed.priority > existing.priority) {
          byId.set(ev.id, {
            match,
            priority: feed.priority,
            ts: Number.isFinite(ts) ? ts : now,
          });
        }
      }
    }

    const sorted = Array.from(byId.values())
      .sort((a, b) => {
        // Live matches first, then newest finished matches
        if (a.match.state === 'in' && b.match.state !== 'in') return -1;
        if (b.match.state === 'in' && a.match.state !== 'in') return 1;
        if (b.ts !== a.ts) return b.ts - a.ts;
        return b.priority - a.priority;
      })
      .map((entry) => entry.match)
      .slice(0, 30);

    cachedMatches = {
      matches: sorted,
      fetchedAt: Date.now(),
    };
    return sorted;
  })();

  try {
    const matches = await inFlightMatches;
    return { matches, fetchedAt: cachedMatches?.fetchedAt ?? now };
  } finally {
    inFlightMatches = null;
  }
}

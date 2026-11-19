import type { FootballMatch } from '../types/news';

interface ScoreboardFeed {
  slug: string;
  arabicLeague?: string;
  priority: number;
}

const CLIENT_FEEDS: ScoreboardFeed[] = [
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

const COUNTRY_ISO_MAP: Record<string, string> = {
  Iraq: 'iq',
  'United Arab Emirates': 'ae',
  UAE: 'ae',
  'Saudi Arabia': 'sa',
  Qatar: 'qa',
  Jordan: 'jo',
  Kuwait: 'kw',
  Oman: 'om',
  Bahrain: 'bh',
  Egypt: 'eg',
  Morocco: 'ma',
  Algeria: 'dz',
  Tunisia: 'tn',
  Yemen: 'ye',
  Syria: 'sy',
  Lebanon: 'lb',
  Palestine: 'ps',
  Brazil: 'br',
  Argentina: 'ar',
  France: 'fr',
  Spain: 'es',
  England: 'gb-eng',
  Scotland: 'gb-sct',
  Wales: 'gb-wls',
  'Northern Ireland': 'gb-nir',
  'N Ireland': 'gb-nir',
  Germany: 'de',
  Italy: 'it',
  Portugal: 'pt',
  Netherlands: 'nl',
  Belgium: 'be',
  Croatia: 'hr',
  Denmark: 'dk',
  Norway: 'no',
  Sweden: 'se',
  Switzerland: 'ch',
  Austria: 'at',
  Poland: 'pl',
  Turkey: 'tr',
  Türkiye: 'tr',
  Romania: 'ro',
  Hungary: 'hu',
  'Bosnia-Herzegovina': 'ba',
  'Bosnia-Herz': 'ba',
  Ukraine: 'ua',
  Serbia: 'rs',
  Greece: 'gr',
  Japan: 'jp',
  'South Korea': 'kr',
  Iran: 'ir',
  Australia: 'au',
  Uzbekistan: 'uz',
  Malaysia: 'my',
  Singapore: 'sg',
  Indonesia: 'id',
  Uruguay: 'uy',
  Colombia: 'co',
  Chile: 'cl',
  Ecuador: 'ec',
  Bolivia: 'bo',
  Panama: 'pa',
  'Costa Rica': 'cr',
  'Dominican Rep': 'do',
  'Dominican Republic': 'do',
  Haiti: 'ht',
  Mozambique: 'mz',
  Uganda: 'ug',
  'New Caledonia': 'nc',
  'New Zealand': 'nz',
  Mexico: 'mx',
  'United States': 'us',
  USA: 'us',
  Canada: 'ca',
};

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
  Bayern: 'بايرن ميونخ',
  'Borussia Dortmund': 'بوروسيا دورتموند',
  Internazionale: 'إنتر ميلان',
  'Inter Milan': 'إنتر ميلان',
  'AC Milan': 'ميلان',
  Juventus: 'يوفنتوس',
  Napoli: 'نابولي',
  'AS Roma': 'روما',
  Roma: 'روما',
  Benfica: 'بنفيكا',
  'Celta Vigo': 'سيلتا فيغو',
  Espanyol: 'إسبانيول',
  Valencia: 'فالنسيا',
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
  Romania: 'رومانيا',
  Hungary: 'المجر',
  'Bosnia-Herzegovina': 'البوسنة والهرسك',
  'Bosnia-Herz': 'البوسنة والهرسك',
  'Northern Ireland': 'أيرلندا الشمالية',
  'N Ireland': 'أيرلندا الشمالية',
  'South Korea': 'كوريا الجنوبية',
  Australia: 'أستراليا',
  Greece: 'اليونان',
  Uruguay: 'الأوروغواي',
  Ecuador: 'الإكوادور',
  Bolivia: 'بوليفيا',
  Colombia: 'كولومبيا',
  Chile: 'تشيلي',
  Panama: 'بنما',
  'Costa Rica': 'كوستاريكا',
  'Dominican Rep': 'الدومينيكان',
  Uganda: 'أوغندا',
  Mozambique: 'موزمبيق',
  Haiti: 'هايتي',
  'New Caledonia': 'كاليدونيا الجديدة',
  'Al Hilal': 'الهلال',
  'Al Nassr': 'النصر',
  'Al Ahli': 'الأهلي',
  'Al Ittihad': 'الاتحاد',
};

function stripSuffix(name: string): string {
  return name.replace(/\s+(U-?\d+|Women|Femenino|Féminines|FC|CF|SC)$/i, '').trim();
}

function translateLeague(rawName: string, slug: string): string {
  const s = `${rawName} ${slug}`.toLowerCase();
  if (s.includes('champions')) return 'دوري أبطال أوروبا';
  if (s.includes('nations')) return 'دوري الأمم الأوروبية';
  if (s.includes('friendly')) return 'مباراة ودية دولية';
  if (s.includes('worldq') || s.includes('qualifying')) return 'تصفيات كأس العالم';
  if (s.includes('english premier') || s.includes('eng.1')) return 'الدوري الإنجليزي';
  if (s.includes('laliga') || s.includes('esp.1')) return 'الدوري الإسباني';
  if (s.includes('serie a') && s.includes('ita')) return 'الدوري الإيطالي';
  if (s.includes('brasileiro') || s.includes('bra.1')) return 'الدوري البرازيلي';
  if (s.includes('bundesliga') || s.includes('ger.1')) return 'الدوري الألماني';
  if (s.includes('ligue 1') || s.includes('fra.1')) return 'الدوري الفرنسي';
  if (s.includes('saudi') || s.includes('ksa.1')) return 'الدوري السعودي';
  if (s.includes('group-stage') || s.includes('world-cup')) return 'بطولة دولية للمنتخبات';
  return rawName || 'مباراة كرة قدم';
}

function translateStatus(state: 'in' | 'post' | 'pre', detail: string, dateStr: string): string {
  const d = (detail || '').trim();
  if (state === 'in') return d === 'HT' ? 'مباشر · استراحة' : d ? `مباشر · ${d}` : 'جارية الآن';
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

export async function fetchClientMatchesDirect(): Promise<FootballMatch[]> {
  const now = Date.now();
  const byId = new Map<string, { match: FootballMatch; priority: number; ts: number }>();

  const settled = await Promise.allSettled(
    CLIENT_FEEDS.map(async (feed) => {
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${feed.slug}/scoreboard`,
        { headers: { Accept: 'application/json' } }
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
              team?: {
                displayName?: string;
                shortDisplayName?: string;
                logo?: string;
                logos?: Array<{ href?: string }>;
              };
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
    for (const ev of json.events ?? []) {
      if (!ev.id || !ev.date) continue;
      const rawState = ev.status?.type?.state;
      const state: 'in' | 'post' | 'pre' =
        rawState === 'in' ? 'in' : rawState === 'post' ? 'post' : 'pre';
      if (state === 'pre') continue;

      const ts = Date.parse(ev.date);
      if (Number.isFinite(ts) && now - ts > 10 * 24 * 60 * 60 * 1000) continue;

      const competitors = ev.competitions?.[0]?.competitors ?? [];
      if (competitors.length < 2) continue;

      const home = competitors.find((c) => c.homeAway === 'home') ?? competitors[0];
      const away = competitors.find((c) => c.homeAway === 'away') ?? competitors[1];

      const homeShort = (home.team?.shortDisplayName || home.team?.displayName || '').trim();
      const awayShort = (away.team?.shortDisplayName || away.team?.displayName || '').trim();
      if (!homeShort || !awayShort) continue;

      const homeIso = COUNTRY_ISO_MAP[homeShort] ?? COUNTRY_ISO_MAP[stripSuffix(homeShort)];
      const awayIso = COUNTRY_ISO_MAP[awayShort] ?? COUNTRY_ISO_MAP[stripSuffix(awayShort)];
      const homeEspn = home.team?.logo?.trim() || home.team?.logos?.[0]?.href?.trim();
      const awayEspn = away.team?.logo?.trim() || away.team?.logos?.[0]?.href?.trim();
      const homeFlag = homeIso ? `https://flagcdn.com/w80/${homeIso}.png` : undefined;
      const awayFlag = awayIso ? `https://flagcdn.com/w80/${awayIso}.png` : undefined;

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

      const match: FootballMatch = {
        id: ev.id,
        league: feed.arabicLeague || translateLeague(rawLeagueName || ev.season?.slug || '', feed.slug),
        date: ev.date,
        state,
        statusLabel: translateStatus(state, ev.status?.type?.shortDetail || '', ev.date),
        homeName: TEAM_ARABIC_MAP[homeShort] ?? TEAM_ARABIC_MAP[stripSuffix(homeShort)] ?? homeShort,
        homeLogo: homeEspn || homeFlag,
        homeFallbackLogo: homeEspn && homeFlag ? homeFlag : undefined,
        homeScore,
        awayName: TEAM_ARABIC_MAP[awayShort] ?? TEAM_ARABIC_MAP[stripSuffix(awayShort)] ?? awayShort,
        awayLogo: awayEspn || awayFlag,
        awayFallbackLogo: awayEspn && awayFlag ? awayFlag : undefined,
        awayScore,
        winner,
        isInternational: Boolean(homeIso || awayIso),
      };

      const existing = byId.get(ev.id);
      if (!existing || feed.priority > existing.priority) {
        byId.set(ev.id, { match, priority: feed.priority, ts: Number.isFinite(ts) ? ts : now });
      }
    }
  }

  return Array.from(byId.values())
    .sort((a, b) => {
      if (a.match.state === 'in' && b.match.state !== 'in') return -1;
      if (b.match.state === 'in' && a.match.state !== 'in') return 1;
      if (b.ts !== a.ts) return b.ts - a.ts;
      return b.priority - a.priority;
    })
    .map((e) => e.match)
    .slice(0, 30);
}

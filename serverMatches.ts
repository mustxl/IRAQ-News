import type { FootballMatch } from './src/types/news.js';

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

// ISO-3166 alpha-2 codes for FlagCDN crisp country flags (secondary fallback + missing ESPN country emblems)
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
  Libya: 'ly',
  Sudan: 'sd',
  Mauritania: 'mr',
  Somalia: 'so',
  Djibouti: 'dj',
  Comoros: 'km',
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
  Czechia: 'cz',
  'Czech Republic': 'cz',
  Slovakia: 'sk',
  Slovenia: 'si',
  Finland: 'fi',
  Iceland: 'is',
  Ireland: 'ie',
  'Republic of Ireland': 'ie',
  Albania: 'al',
  Georgia: 'ge',
  'North Macedonia': 'mk',
  Montenegro: 'me',
  Kosovo: 'xk',
  Bulgaria: 'bg',
  Israel: 'il',
  Luxembourg: 'lu',
  Estonia: 'ee',
  Latvia: 'lv',
  Lithuania: 'lt',
  Cyprus: 'cy',
  Malta: 'mt',
  Kazakhstan: 'kz',
  Azerbaijan: 'az',
  Armenia: 'am',
  Moldova: 'md',
  Belarus: 'by',
  Japan: 'jp',
  'South Korea': 'kr',
  'Korea Republic': 'kr',
  Iran: 'ir',
  Australia: 'au',
  Uzbekistan: 'uz',
  Malaysia: 'my',
  Singapore: 'sg',
  Indonesia: 'id',
  Thailand: 'th',
  Vietnam: 'vn',
  China: 'cn',
  India: 'in',
  Pakistan: 'pk',
  Tajikistan: 'tj',
  Kyrgyzstan: 'kg',
  Turkmenistan: 'tm',
  'North Korea': 'kp',
  Philippines: 'ph',
  Uruguay: 'uy',
  Colombia: 'co',
  Chile: 'cl',
  Ecuador: 'ec',
  Bolivia: 'bo',
  Peru: 'pe',
  Paraguay: 'py',
  Venezuela: 've',
  Mexico: 'mx',
  'United States': 'us',
  USA: 'us',
  Canada: 'ca',
  'Costa Rica': 'cr',
  Panama: 'pa',
  Jamaica: 'jm',
  Honduras: 'hn',
  'El Salvador': 'sv',
  Guatemala: 'gt',
  'Dominican Republic': 'do',
  'Dominican Rep': 'do',
  Haiti: 'ht',
  Cuba: 'cu',
  'Trinidad and Tobago': 'tt',
  Senegal: 'sn',
  Nigeria: 'ng',
  Cameroon: 'cm',
  Ghana: 'gh',
  'Ivory Coast': 'ci',
  "Côte d'Ivoire": 'ci',
  Mali: 'ml',
  'Burkina Faso': 'bf',
  'South Africa': 'za',
  DR: 'cd',
  'DR Congo': 'cd',
  Congo: 'cg',
  Angola: 'ao',
  Zambia: 'zm',
  Zimbabwe: 'zw',
  Guinea: 'gn',
  Gabon: 'ga',
  Cape: 'cv',
  'Cape Verde': 'cv',
  Mozambique: 'mz',
  Uganda: 'ug',
  Kenya: 'ke',
  Tanzania: 'tz',
  Ethiopia: 'et',
  'New Zealand': 'nz',
  'New Caledonia': 'nc',
  Fiji: 'fj',
};

// Known club crests when ESPN omits team.logo on women's/cup/reserve variants
const CLUB_LOGO_FALLBACK_MAP: Record<string, string> = {
  'Celta Vigo': 'https://a.espncdn.com/i/teamlogos/soccer/500/85.png',
  Valencia: 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png',
  Espanyol: 'https://a.espncdn.com/i/teamlogos/soccer/500/88.png',
  'Real Madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
  Barcelona: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
  'Atletico Madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
  Sevilla: 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png',
  'Real Betis': 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png',
  Villarreal: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png',
  'Athletic Club': 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png',
  'Real Sociedad': 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png',
  Arsenal: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
  Liverpool: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png',
  Chelsea: 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png',
  'Manchester City': 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
  'Manchester United': 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
  'Tottenham Hotspur': 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png',
  'Bayern Munich': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  Bayern: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  'Borussia Dortmund': 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
  'Paris Saint-Germain': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  Juventus: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
  'AC Milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
  Internazionale: 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
  'AS Roma': 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
  Roma: 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
  Napoli: 'https://a.espncdn.com/i/teamlogos/soccer/500/114.png',
  Benfica: 'https://a.espncdn.com/i/teamlogos/soccer/500/1929.png',
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
  'Paris FC': 'باريس إف سي',
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
  'Madrid CFF': 'مدريد سي إف إف',
  'CD Argual': 'أرغوال',
  Argual: 'أرغوال',
  Lyonnes: 'ليون',
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
  'Bosnia-Herz': 'البوسنة والهرسك',
  'Northern Ireland': 'أيرلندا الشمالية',
  'N Ireland': 'أيرلندا الشمالية',
  Scotland: 'اسكتلندا',
  Wales: 'ويلز',
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
  Uruguay: 'الأوروغواي',
  Ecuador: 'الإكوادور',
  Bolivia: 'بوليفيا',
  Colombia: 'كولومبيا',
  Chile: 'تشيلي',
  Peru: 'بيرو',
  Paraguay: 'باراغواي',
  Venezuela: 'فنزويلا',
  Panama: 'بنما',
  'Costa Rica': 'كوستاريكا',
  'Dominican Rep': 'الدومينيكان',
  'Dominican Republic': 'الدومينيكان',
  Uganda: 'أوغندا',
  Mozambique: 'موزمبيق',
  Haiti: 'هايتي',
  'New Caledonia': 'كاليدونيا الجديدة',
  'New Zealand': 'نيوزيلندا',
  Mexico: 'المكسيك',
  'United States': 'الولايات المتحدة',
  USA: 'الولايات المتحدة',
  Canada: 'كندا',
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
  Vasco: 'فاسكو دا غاما',
  Internacional: 'إنترناسيونال',
  Vitória: 'فيتوريا',
  Bragantino: 'براغانتينو',
  Peñarol: 'بنيارول',
};

function stripVariantSuffix(name: string): string {
  return name
    .replace(/\s+(U-?\d+|Women|Femenino|Féminines|FC|CF|SC)$/i, '')
    .trim();
}

function getCountryIso(rawName: string): string | undefined {
  const clean = rawName.trim();
  return COUNTRY_ISO_MAP[clean] ?? COUNTRY_ISO_MAP[stripVariantSuffix(clean)];
}

function resolveTeamLogos(
  rawName: string,
  displayName: string,
  espnLogo?: string,
  logosArr?: Array<{ href?: string }>
): { logo?: string; fallbackLogo?: string; isCountry: boolean } {
  const iso = getCountryIso(rawName) ?? getCountryIso(displayName);
  const flagCdn = iso ? `https://flagcdn.com/w80/${iso}.png` : undefined;

  const cleanEspn =
    (espnLogo && espnLogo.trim()) ||
    (logosArr?.find((l) => l.href?.trim())?.href?.trim() ?? '');

  if (iso && flagCdn) {
    // Prefer ESPN country logo when present, with guaranteed FlagCDN backup (and FlagCDN direct if ESPN omitted it)
    return {
      logo: cleanEspn || flagCdn,
      fallbackLogo: cleanEspn ? flagCdn : undefined,
      isCountry: true,
    };
  }

  const clubBackup =
    CLUB_LOGO_FALLBACK_MAP[rawName.trim()] ??
    CLUB_LOGO_FALLBACK_MAP[displayName.trim()] ??
    CLUB_LOGO_FALLBACK_MAP[stripVariantSuffix(rawName)] ??
    CLUB_LOGO_FALLBACK_MAP[stripVariantSuffix(displayName)];

  if (cleanEspn) {
    return {
      logo: cleanEspn,
      fallbackLogo: clubBackup && clubBackup !== cleanEspn ? clubBackup : undefined,
      isCountry: false,
    };
  }

  return {
    logo: clubBackup,
    fallbackLogo: undefined,
    isCountry: false,
  };
}

function translateTeam(name: string): string {
  const clean = name.trim();
  return TEAM_ARABIC_MAP[clean] ?? TEAM_ARABIC_MAP[stripVariantSuffix(clean)] ?? clean;
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
  if (s.includes('copa del rey') || s.includes('copa de la reina') || s.includes('first-round') || s.includes('third-round'))
    return 'كأس إسبانيا';
  if (s.includes('clausura') || s.includes('apertura')) return 'دوري أمريكا اللاتينية';
  if (s.includes('group-stage') || s.includes('world-cup')) return 'بطولة دولية للمنتخبات';
  if (s.includes('league-phase')) return 'بطولة أوروبية';
  if (s.includes('regular-season')) return 'مباراة دوري محلي';
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
      const events = json.events ?? [];

      for (const ev of events) {
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
        const homeFull = (home.team?.displayName || homeShort).trim();
        const awayShort = (away.team?.shortDisplayName || away.team?.displayName || '').trim();
        const awayFull = (away.team?.displayName || awayShort).trim();
        if (!homeShort || !awayShort) continue;

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

        const homeLogos = resolveTeamLogos(homeShort, homeFull, home.team?.logo, home.team?.logos);
        const awayLogos = resolveTeamLogos(awayShort, awayFull, away.team?.logo, away.team?.logos);

        const leagueLabel =
          feed.arabicLeague ||
          translateLeague(rawLeagueName || ev.season?.slug || '', feed.slug);

        const match: FootballMatch = {
          id: ev.id,
          league: leagueLabel,
          date: ev.date,
          state,
          statusLabel: translateStatus(state, ev.status?.type?.shortDetail || '', ev.date),
          homeName: translateTeam(homeShort),
          homeLogo: homeLogos.logo,
          homeFallbackLogo: homeLogos.fallbackLogo,
          homeScore,
          awayName: translateTeam(awayShort),
          awayLogo: awayLogos.logo,
          awayFallbackLogo: awayLogos.fallbackLogo,
          awayScore,
          winner,
          isInternational: homeLogos.isCountry || awayLogos.isCountry,
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

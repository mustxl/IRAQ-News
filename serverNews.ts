import crypto from 'crypto';
import type { NewsArticle } from './src/types/news.js';

const IMG_BAGHDAD = '/src/assets/images/iraq_baghdad_heritage_1795018318321.jpg';
const IMG_PORT = '/src/assets/images/iraq_development_port_1795018318837.jpg';
const IMG_WORLD = '/src/assets/images/world_summit_diplomacy_1795018319440.jpg';
const IMG_TECH = '/src/assets/images/tech_gaming_hardware_1795018320152.jpg';
const IMG_SPACE = '/src/assets/images/science_space_nebula_1795018319436.jpg';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const CACHE_TTL_MS = 20 * 1000; // 20 seconds so new articles appear immediately as they drop
const MIN_PER_SOURCE = 15; // Guarantee at least 12+ (15) newest items per source when available
const MAX_PER_SOURCE = 75;

interface FeedConfig {
  id: string;
  url: string;
  region: 'iraq' | 'world' | 'sports' | 'tech';
  defaultSourceId: string;
  defaultSourceName?: string;
  lockSourceId?: boolean;
  type?: 'rss' | 'telegram';
}

const FEEDS: FeedConfig[] = [
  // 1. وكالة الأنباء العراقية (واع)
  {
    id: 'ina-rss',
    url: 'https://ina.iq/rss.xml',
    region: 'iraq',
    defaultSourceId: 'ina',
    defaultSourceName: 'وكالة الأنباء العراقية (واع)',
    lockSourceId: true,
  },
  {
    id: 'gnews-ina',
    url: 'https://news.google.com/rss/search?q=site:ina.iq&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'ina',
    defaultSourceName: 'وكالة الأنباء العراقية (واع)',
    lockSourceId: true,
  },
  // 2. العراقية الإخبارية
  {
    id: 'gnews-iraqiya',
    url: 'https://news.google.com/rss/search?q=(site:imn.iq+OR+site:iraqinews.com)&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'iraqiya',
    defaultSourceName: 'العراقية الإخبارية',
    lockSourceId: true,
  },
  // 3. الشرقية
  {
    id: 'gnews-sharqiya',
    url: 'https://news.google.com/rss/search?q=site:alsharqiya.com&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'sharqiya',
    defaultSourceName: 'الشرقية',
    lockSourceId: true,
  },
  // 4. السومرية
  {
    id: 'gnews-alsumaria',
    url: 'https://news.google.com/rss/search?q=site:alsumaria.tv&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'alsumaria',
    defaultSourceName: 'السومرية',
    lockSourceId: true,
  },
  // 5. جريدة الصباح
  {
    id: 'alsabah-rss',
    url: 'https://alsabaah.iq/rss.xml',
    region: 'iraq',
    defaultSourceId: 'alsabah',
    defaultSourceName: 'الصباح',
    lockSourceId: true,
  },
  {
    id: 'gnews-alsabah',
    url: 'https://news.google.com/rss/search?q=site:alsabaah.iq&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'alsabah',
    defaultSourceName: 'الصباح',
    lockSourceId: true,
  },
  // 6. جريدة الزمان
  {
    id: 'gnews-azzaman',
    url: 'https://news.google.com/rss/search?q=site:azzaman.com&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'azzaman',
    defaultSourceName: 'الزمان',
    lockSourceId: true,
  },
  // 7. جريدة المدى
  {
    id: 'almada-rss-1',
    url: 'https://almadapaper.net/feed/',
    region: 'iraq',
    defaultSourceId: 'almada',
    defaultSourceName: 'المدى',
    lockSourceId: true,
  },
  {
    id: 'almada-rss-2',
    url: 'https://almadapaper.net/feed/?paged=2',
    region: 'iraq',
    defaultSourceId: 'almada',
    defaultSourceName: 'المدى',
    lockSourceId: true,
  },
  {
    id: 'gnews-almada',
    url: 'https://news.google.com/rss/search?q=site:almadapaper.net&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'almada',
    defaultSourceName: 'المدى',
    lockSourceId: true,
  },
  // 8. الخوة النظيفة (تيليغرام - https://t.me/BROTHERSIRQ)
  {
    id: 'khuwa-tg-live',
    url: 'https://t.me/s/BROTHERSIRQ',
    region: 'iraq',
    defaultSourceId: 'khuwa_nadhifa',
    defaultSourceName: 'الخوة النظيفة (تيليغرام)',
    lockSourceId: true,
    type: 'telegram',
  },
  // 9. صابرين نيوز (تيليغرام - https://t.me/SabrenNewss)
  {
    id: 'sabereen-tg-live',
    url: 'https://t.me/s/SabrenNewss',
    region: 'iraq',
    defaultSourceId: 'sabereen_news',
    defaultSourceName: 'صابرين نيوز (تيليغرام)',
    lockSourceId: true,
    type: 'telegram',
  },
  {
    id: 'gnews-sabereen-24h',
    url: 'https://news.google.com/rss/search?q=%D8%B5%D8%A7%D8%A8%D8%B1%D9%8A%D9%86+%D9%86%D9%8A%D9%88%D8%B2+when:24h&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'sabereen_news',
    defaultSourceName: 'صابرين نيوز (تيليغرام)',
    lockSourceId: true,
  },
  // 10. الجزيرة - العراق
  {
    id: 'gnews-aljazeera-iq',
    url: 'https://news.google.com/rss/search?q=site:aljazeera.net+%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'aljazeera_iq',
    defaultSourceName: 'الجزيرة - العراق',
    lockSourceId: true,
  },
  // 11. العربية - العراق
  {
    id: 'gnews-alarabiya-iq',
    url: 'https://news.google.com/rss/search?q=site:alarabiya.net+%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'alarabiya_iq',
    defaultSourceName: 'العربية - العراق',
    lockSourceId: true,
  },
  // تغطية فورية شاملة للعراق والمحافظات والقطاعات
  {
    id: 'gnews-iraq-24h',
    url: 'https://news.google.com/rss/search?q=%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82+when:24h&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'iraqiya',
  },
  {
    id: 'gnews-iraq-govs-24h',
    url: 'https://news.google.com/rss/search?q=(%D8%A8%D8%BA%D8%AF%D8%A7%D8%AF+OR+%D8%A7%D9%84%D8%A8%D8%B5%D8%B1%D8%A9+OR+%D9%83%D8%B1%D8%A8%D9%84%D8%A7%D8%A1+OR+%D8%A3%D8%B1%D8%A8%D9%8A%D9%84+OR+%D9%86%D9%8A%D9%86%D9%88%D9%89+OR+%D8%A7%D9%84%D9%86%D8%AC%D9%81)+when:24h&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'alsumaria',
  },
  {
    id: 'gnews-iraq-econ-24h',
    url: 'https://news.google.com/rss/search?q=(%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF+%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82+OR+%D8%A7%D9%84%D9%86%D9%81%D8%B7+%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82+OR+%D8%B1%D9%8A%D8%A7%D8%B6%D8%A9+%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82)+when:24h&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'iraq',
    defaultSourceId: 'sharqiya',
  },
  // 12. أخبار العالم (سكاي نيوز، BBC، فرانس 24، الجزيرة)
  {
    id: 'skynews-arabia',
    url: 'https://www.skynewsarabia.com/rss.xml',
    region: 'world',
    defaultSourceId: 'world_desk',
    defaultSourceName: 'سكاي نيوز عربية',
    lockSourceId: true,
  },
  {
    id: 'bbc-arabic',
    url: 'https://feeds.bbci.co.uk/arabic/rss.xml',
    region: 'world',
    defaultSourceId: 'world_desk',
    defaultSourceName: 'BBC عربي',
    lockSourceId: true,
  },
  {
    id: 'france24-arabic',
    url: 'https://www.france24.com/ar/rss',
    region: 'world',
    defaultSourceId: 'world_desk',
    defaultSourceName: 'فرانس 24',
    lockSourceId: true,
  },
  {
    id: 'aljazeera-arabic',
    url: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff09cab6c',
    region: 'world',
    defaultSourceId: 'world_desk',
    defaultSourceName: 'الجزيرة نت',
    lockSourceId: true,
  },
  // 13. التكنولوجيا والعلوم والألعاب
  {
    id: 'gnews-tech-24h',
    url: 'https://news.google.com/rss/search?q=(%D8%AA%D9%83%D9%86%D9%88%D9%84%D9%88%D8%AC%D9%8A%D8%A7+OR+%D8%B0%D9%83%D8%A7%D8%A1+%D8%A7%D8%B5%D8%B7%D9%86%D8%A7%D8%B9%D9%8A+OR+%D8%A3%D9%84%D8%B9%D8%A7%D8%A8+%D8%A5%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%86%D9%8A%D8%A9+OR+%D9%81%D8%B6%D8%A7%D8%A1)+when:24h&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'tech',
    defaultSourceId: 'tech_hub',
    lockSourceId: true,
  },
  {
    id: 'aitnews',
    url: 'https://aitnews.com/feed/',
    region: 'tech',
    defaultSourceId: 'tech_hub',
    defaultSourceName: 'البوابة العربية للأخبار التقنية',
    lockSourceId: true,
  },
  {
    id: 'tech-wd',
    url: 'https://www.tech-wd.com/wd/feed/',
    region: 'tech',
    defaultSourceId: 'tech_hub',
    defaultSourceName: 'عالم التقنية',
    lockSourceId: true,
  },
  // 14. أخبار الرياضة (العراقية والأوروبية والعالمية)
  {
    id: 'gnews-iq-sports',
    url: 'https://news.google.com/rss/search?q=(%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AE%D8%A8+%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82%D9%8A+OR+%D8%AF%D9%88%D8%B1%D9%8A+%D9%86%D8%AC%D9%88%D9%85+%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82+OR+%D9%83%D8%B1%D8%A9+%D8%A7%D9%84%D9%82%D8%AF%D9%85+%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82%D9%8A%D8%A9)+when:24h&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'sports',
    defaultSourceId: 'sports_hub',
    lockSourceId: true,
  },
  {
    id: 'gnews-eu-sports',
    url: 'https://news.google.com/rss/search?q=(%D8%AF%D9%88%D8%B1%D9%8A+%D8%A3%D8%A8%D8%B7%D8%A7%D9%84+%D8%A3%D9%88%D8%B1%D9%88%D8%A8%D8%A7+OR+%D8%B1%D9%8A%D8%A7%D9%84+%D9%85%D8%AF%D8%B1%D9%8A%D8%AF+OR+%D8%A8%D8%B1%D8%B4%D9%84%D9%88%D9%86%D8%A9+OR+%D8%A7%D9%84%D8%AF%D9%88%D8%B1%D9%8A+%D8%A7%D9%84%D8%A5%D9%86%D8%AC%D9%84%D9%8A%D8%B2%D9%8A)+when:24h&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'sports',
    defaultSourceId: 'sports_hub',
    lockSourceId: true,
  },
  {
    id: 'skynews-sport',
    url: 'https://www.skynewsarabia.com/rss/sport.xml',
    region: 'sports',
    defaultSourceId: 'sports_hub',
    defaultSourceName: 'سكاي نيوز رياضة',
    lockSourceId: true,
  },
  {
    id: 'france24-sport',
    url: 'https://www.france24.com/ar/%D8%B1%D9%8A%D8%A7%D8%B6%D8%A9/rss',
    region: 'sports',
    defaultSourceId: 'sports_hub',
    defaultSourceName: 'فرانس 24 رياضة',
    lockSourceId: true,
  },
  {
    id: 'gnews-world-sports',
    url: 'https://news.google.com/rss/search?q=(%D9%83%D8%A3%D8%B3+%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85+OR+%D8%AA%D9%86%D8%B3+OR+%D9%81%D9%88%D8%B1%D9%85%D9%88%D9%84%D8%A7+OR+%D8%A7%D9%84%D9%85%D9%86%D8%AA%D8%AE%D8%A8%D8%A7%D8%AA)+when:24h&hl=ar&gl=IQ&ceid=IQ:ar',
    region: 'sports',
    defaultSourceId: 'sports_hub',
    lockSourceId: true,
  },
];

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(re);
  return match ? decodeEntities(match[1]) : '';
}

export function formatRelativeArabicTime(timestampMs: number): string {
  const diffMs = Math.max(0, Date.now() - timestampMs);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 2) return 'الآن';
  if (mins === 2) return 'منذ دقيقتين';
  if (mins <= 10) return `منذ ${mins} دقائق`;
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return 'منذ ساعة';
  if (hours === 2) return 'منذ ساعتين';
  if (hours <= 10) return `منذ ${hours} ساعات`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'منذ يوم واحد';
  if (days === 2) return 'منذ يومين';
  if (days <= 10) return `منذ ${days} أيام`;
  return `منذ ${days} يوماً`;
}

function detectGovernorate(text: string): string | undefined {
  if (/بغداد|الكرخ|الرصافة/.test(text)) return 'بغداد';
  if (/كربلاء/.test(text)) return 'كربلاء';
  if (/البصرة|الفاو/.test(text)) return 'البصرة';
  if (/أربيل|اربيل|كردستان/.test(text)) return 'أربيل';
  if (/نينوى|الموصل/.test(text)) return 'نينوى';
  if (/النجف/.test(text)) return 'النجف';
  return undefined;
}

function classifyIraqCategory(text: string): string {
  if (/كرة|منتخب|ملعب|دوري|مباراة|بطولة|كأس|نادي|رياضة/.test(text)) return 'رياضة عراقية';
  if (/نفط|غاز|كهرباء|طاقة|اقتصاد|بنك|دولار|دينار|استثمار|ميناء|تجارة|موازنة|رواتب|أسعار/.test(text)) {
    return 'اقتصاد وطاقة';
  }
  if (/ماء|مياه|مجسر|جسر|طريق|بلدية|مدرسة|جامعة|مستشفى|خدمات|إعمار|مطار|نقل/.test(text)) {
    return 'خدمات ومحافظات';
  }
  return 'سياسة';
}

function classifyWorldCategory(text: string): string {
  if (/كرة|دوري|مباراة|أبطال|كأس|منتخب|أولمبياد|تنس|ريال|برشلونة|ليفربول/.test(text)) {
    return 'رياضة عالمية';
  }
  if (/صحة|طب|دراسة|علاج|قلب|نوم|غذاء|لقاح|مستشفى|بيئة|مناخ/.test(text)) {
    return 'صحة ومنوعات';
  }
  if (/نفط|ذهب|بورصة|أسواق|تضخم|فائدة|دولار|شركات|اقتصاد|تجارة|بنك/.test(text)) {
    return 'اقتصاد وأسواق';
  }
  return 'سياسة دولية';
}

function classifyTechCategory(text: string): string {
  if (/لعبة|ألعاب|بلايستيشن|إكس بوكس|ps5|xbox|nintendo|ستيم|قيمنق|غيمز/.test(text.toLowerCase())) {
    return 'ألعاب إلكترونية';
  }
  if (/فضاء|ناسا|تلسكوب|كوكب|قمر|مجرة|شمس|فلك|صاروخ/.test(text)) {
    return 'علوم وفضاء';
  }
  if (/اختراع|ابتكار|بطارية|طاقة شمسية|روبوت|اكتشاف|شريحة|مادة/.test(text)) {
    return 'اختراعات واكتشافات';
  }
  return 'ذكاء اصطناعي وتقنية';
}

function classifySportsCategory(text: string): string {
  if (/عراق|بغداد|البصرة|الشرطة|الزوراء|القوة الجوية|الطلبة|أربيل|النجف|الميناء|الكرخ|زاخو|أسود الرافدين|دوري نجوم/.test(text)) {
    return 'كرة القدم العراقية';
  }
  if (/تنس|فورمولا|سباحة|ملاكمة|كرة سلة|سلة|أولمبي|جودو|ألعاب القوى|طائرة/.test(text)) {
    return 'رياضات متنوعة';
  }
  if (/أوروب|ريال|برشلونة|ليفربول|سيتي|أرسنال|تشيلسي|يونايتد|بايرن|ميلان|إنتر|سان جيرمان|الأبطال|الإنجليزي|الإسباني|الإيطالي/.test(text)) {
    return 'الدوريات الأوروبية';
  }
  return 'بطولات عالمية';
}

function mapSourceId(
  sourceLabel: string,
  fallbackId: string,
  region: 'iraq' | 'world' | 'sports' | 'tech'
): string {
  if (region === 'world') return 'world_desk';
  if (region === 'sports') return 'sports_hub';
  if (region === 'tech') return 'tech_hub';
  const s = sourceLabel.toLowerCase();
  if (s.includes('واع') || s.includes('الأنباء العراقية') || s.includes('ina')) return 'ina';
  if (s.includes('الشرقية') || s.includes('alsharqiya')) return 'sharqiya';
  if (s.includes('السومرية') || s.includes('alsumaria')) return 'alsumaria';
  if (s.includes('العراقية') || s.includes('imn') || s.includes('iraqinews')) return 'iraqiya';
  if (s.includes('الصباح') || s.includes('alsabaah')) return 'alsabah';
  if (s.includes('الزمان') || s.includes('azzaman')) return 'azzaman';
  if (s.includes('المدى') || s.includes('almadapaper')) return 'almada';
  if (s.includes('الخوة')) return 'khuwa_nadhifa';
  if (s.includes('صابرين')) return 'sabereen_news';
  if (s.includes('الجزيرة') || s.includes('aljazeera')) return 'aljazeera_iq';
  if (s.includes('العربية') || s.includes('alarabiya')) return 'alarabiya_iq';
  return fallbackId;
}

function pickLocalImage(region: 'iraq' | 'world' | 'sports' | 'tech', category: string, index: number): string {
  if (region === 'tech') {
    return category === 'علوم وفضاء' || category === 'ذكاء اصطناعي وتقنية' ? IMG_SPACE : IMG_TECH;
  }
  if (region === 'sports') {
    return category === 'كرة القدم العراقية' ? IMG_BAGHDAD : index % 2 === 0 ? IMG_WORLD : IMG_PORT;
  }
  if (region === 'world') {
    return category === 'اقتصاد وأسواق' ? IMG_PORT : IMG_WORLD;
  }
  if (category === 'اقتصاد وطاقة') return IMG_PORT;
  if (category === 'سياسة') return index % 2 === 0 ? IMG_BAGHDAD : IMG_WORLD;
  return index % 2 === 0 ? IMG_BAGHDAD : IMG_PORT;
}

function buildArticleBody(
  title: string,
  desc: string,
  sourceLabel: string,
  region: 'iraq' | 'world' | 'sports' | 'tech',
  category: string,
  governorate?: string
): { summary: string; highlights: string[]; paragraphs: string[] } {
  const cleanDesc = desc && desc !== title && desc.length > 25 ? desc : title;
  const summary = cleanDesc.length > 170 ? `${cleanDesc.slice(0, 167)}...` : cleanDesc;

  const regionLabel =
    region === 'iraq'
      ? governorate
        ? `الشأن العراقي في محافظة ${governorate}`
        : 'الشأن العراقي'
      : region === 'world'
      ? 'الساحة الدولية'
      : region === 'sports'
      ? 'الملاعب والبطولات الرياضية'
      : 'قطاع التكنولوجيا والابتكار';

  const paragraphs = [
    `${cleanDesc}`,
    `أفاد ${sourceLabel} ضمن متابعته الإخبارية المباشرة بآخر التطورات المتعلقة بملف ${category} في ${regionLabel}.`,
    `وتشير المعطيات الواردة في التقرير إلى استمرار المتابعة الميدانية والمؤسسية لهذا الملف، مع رصد انعكاساته المباشرة على الاهتمام العام ومسار الأحداث الجارية.`,
    `يُذكر أن هذا الخبر ورد ضمن التغطية الفورية من المصادر المعتمدة في التطبيق فور نشره.`,
  ];

  const highlights = [
    title,
    `المصدر الناقل للخبر: ${sourceLabel}.`,
    `التصنيف: ${category}${governorate ? ` · ${governorate}` : ''}.`,
  ];

  return { summary, highlights, paragraphs };
}

const ogImageCache = new Map<string, string | null>();
const MAX_OG_CACHE = 800;

function setOgCache(url: string, img: string | null) {
  if (ogImageCache.size >= MAX_OG_CACHE) {
    const oldest = ogImageCache.keys().next().value;
    if (oldest) ogImageCache.delete(oldest);
  }
  ogImageCache.set(url, img);
}

function isValidNewsImageUrl(url: string | undefined): url is string {
  if (!url) return false;
  const clean = url.trim();
  if (!/^https?:\/\//i.test(clean)) return false;
  if (/\.(svg|mp4|mp3|ogg|wav)(\?|$)/i.test(clean)) return false;
  if (/(avatar|favicon|sprite|pixel|1x1|blank\.gif|logo_small|googleusercontent\.com)/i.test(clean)) {
    return false;
  }
  return true;
}

function extractRssImage(itemXml: string): string | undefined {
  const patterns = [
    /<media:content[^>]+url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i,
    /<enclosure[^>]+url=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const match = itemXml.match(re);
    if (match?.[1]) {
      const candidate = match[1].replace(/&amp;/g, '&').trim();
      if (isValidNewsImageUrl(candidate)) return candidate;
    }
  }
  return undefined;
}

function extractTelegramImage(block: string): string | undefined {
  // Exclude channel user avatar; focus on actual post photos and video posters
  const photoMatch = block.match(
    /class="tgme_widget_message_photo_wrap[^"]*"[^>]*style="[^"]*background-image:url\('([^']+)'\)/i
  );
  if (photoMatch?.[1] && isValidNewsImageUrl(photoMatch[1])) {
    return photoMatch[1];
  }
  const posterMatch = block.match(/<video[^>]+poster="([^"]+)"/i);
  if (posterMatch?.[1] && isValidNewsImageUrl(posterMatch[1])) {
    return posterMatch[1];
  }
  return undefined;
}

function needsHighResEnrichment(art: NewsArticle): boolean {
  if (!art.externalUrl) return false;
  if (art.externalUrl.includes('news.google.com') || art.externalUrl.includes('t.me/')) {
    return false;
  }
  if (ogImageCache.has(art.externalUrl)) return false;
  if (!art.hasArticleImage) return true;
  return art.imageUrl.includes('/95/53/') || art.imageUrl.includes('/ws/240/');
}

async function fetchOgImage(articleUrl: string): Promise<string | null> {
  if (ogImageCache.has(articleUrl)) {
    return ogImageCache.get(articleUrl) ?? null;
  }
  try {
    const res = await fetch(articleUrl, {
      signal: AbortSignal.timeout(2200),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html',
      },
    });
    if (!res.ok) {
      setOgCache(articleUrl, null);
      return null;
    }
    const html = await res.text();
    const og =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1] ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1];
    const clean = og ? og.replace(/&amp;/g, '&').trim() : undefined;
    const valid = isValidNewsImageUrl(clean) ? clean : null;
    setOgCache(articleUrl, valid);
    return valid;
  } catch {
    setOgCache(articleUrl, null);
    return null;
  }
}

async function enrichDirectArticleImages(articles: NewsArticle[], limit = 18): Promise<void> {
  const targets = articles.filter(needsHighResEnrichment).slice(0, limit);
  if (targets.length === 0) return;

  await Promise.allSettled(
    targets.map(async (art) => {
      if (!art.externalUrl) return;
      const img = await fetchOgImage(art.externalUrl);
      if (img) {
        art.imageUrl = img;
        art.hasArticleImage = true;
      }
    })
  );
}

function parseRssItems(feed: FeedConfig, xml: string, now: number): NewsArticle[] {
  const rawItems = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  const results: NewsArticle[] = [];

  for (let i = 0; i < rawItems.length; i++) {
    const itemXml = rawItems[i];
    let title = extractTag(itemXml, 'title');
    if (!title || title.length < 10) continue;

    const rawSource = extractTag(itemXml, 'source');
    let sourceLabel = rawSource || feed.defaultSourceName || 'مصدر إخباري';

    // Google News appends " - Publisher" to title; strip it cleanly
    if (rawSource && title.endsWith(` - ${rawSource}`)) {
      title = title.slice(0, title.length - ` - ${rawSource}`.length).trim();
    } else if (title.includes(' - ') && feed.id.startsWith('gnews')) {
      const parts = title.split(' - ');
      if (parts.length > 1) {
        const last = parts.pop()!.trim();
        if (last.length <= 45) {
          sourceLabel = rawSource || last;
          title = parts.join(' - ').trim();
        }
      }
    }

    const link = extractTag(itemXml, 'link');
    const description = extractTag(itemXml, 'description');
    const pubDateStr = extractTag(itemXml, 'pubDate');
    const parsedTime = pubDateStr ? Date.parse(pubDateStr) : NaN;
    const publishedAt = Number.isFinite(parsedTime)
      ? Math.min(now, parsedTime)
      : now - (i + 1) * 8 * 60 * 1000;

    const combinedText = `${title} ${description}`;
    const governorate = feed.region === 'iraq' ? detectGovernorate(combinedText) : undefined;
    const category =
      feed.region === 'iraq'
        ? classifyIraqCategory(combinedText)
        : feed.region === 'world'
        ? classifyWorldCategory(combinedText)
        : feed.region === 'sports'
        ? classifySportsCategory(combinedText)
        : classifyTechCategory(combinedText);

    const sourceId = feed.lockSourceId
      ? feed.defaultSourceId
      : mapSourceId(sourceLabel, feed.defaultSourceId, feed.region);

    const displaySourceName =
      feed.id.startsWith('gnews-khuwa') || feed.id.startsWith('gnews-sabereen')
        ? feed.defaultSourceName || sourceLabel
        : sourceLabel;

    const { summary, highlights, paragraphs } = buildArticleBody(
      title,
      description,
      displaySourceName,
      feed.region,
      category,
      governorate
    );

    const idHash = crypto
      .createHash('md5')
      .update(`${sourceId}:${title}`)
      .digest('hex')
      .slice(0, 10);

    const cachedOg = link ? ogImageCache.get(link) : undefined;
    const rssImg = extractRssImage(itemXml);
    const resolvedImage = cachedOg || rssImg;

    results.push({
      id: `live-${idHash}`,
      region: feed.region,
      sourceId,
      sourceName: displaySourceName,
      governorate,
      category,
      timeAgo: formatRelativeArabicTime(publishedAt),
      publishedAt,
      readTime: 'دقيقتان قراءة',
      imageUrl: resolvedImage || pickLocalImage(feed.region, category, i),
      hasArticleImage: Boolean(resolvedImage),
      title,
      summary,
      highlights,
      paragraphs,
      externalUrl: link || undefined,
    });
  }

  return results;
}

function parseTelegramItems(
  feed: FeedConfig,
  html: string,
  now: number
): { articles: NewsArticle[]; oldestPostNumber?: number } {
  const blocks = html.split('tgme_widget_message_wrap');
  const results: NewsArticle[] = [];
  let oldestPostNumber: number | undefined;

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const dataPost = block.match(/data-post="([^"]+)"/i)?.[1];
    if (dataPost) {
      const postNum = Number(dataPost.split('/')[1]);
      if (Number.isFinite(postNum) && (oldestPostNumber === undefined || postNum < oldestPostNumber)) {
        oldestPostNumber = postNum;
      }
    }

    const textMatch = block.match(/class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (!textMatch) continue;

    // Split lines on <br/> while cleaning hashtags/channel footer tags
    const rawLines = textMatch[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .split('\n')
      .map((line) => decodeEntities(line))
      .map((line) =>
        line
          .replace(/(?:#الخوة_النظيفة|#صابرين_نيوز|@SabrenNewss|@Sabreen11_bot|@BROTHERSIRQ)\S*/gi, '')
          .trim()
      )
      .filter((line) => line.length > 0);

    const fullText = rawLines.join(' ').replace(/\s+/g, ' ').trim();
    if (fullText.length < 15) continue;

    const timeMatch = block.match(/datetime="([^"]+)"/i);
    const parsedTime = timeMatch ? Date.parse(timeMatch[1]) : NaN;
    const publishedAt = Number.isFinite(parsedTime)
      ? Math.min(now, parsedTime)
      : now - i * 10 * 60 * 1000;

    const postHrefMatch = block.match(/class="tgme_widget_message_date"\s+href="([^"]+)"/i);
    const externalUrl = dataPost ? `https://t.me/${dataPost}` : postHrefMatch?.[1];
    const headlineBase = rawLines[0] || fullText;
    const title = headlineBase.length > 125 ? `${headlineBase.slice(0, 122)}...` : headlineBase;
    const governorate = detectGovernorate(fullText);
    const category = classifyIraqCategory(fullText);
    const sourceLabel = feed.defaultSourceName || 'قناة تيليغرام';
    const { summary, highlights, paragraphs } = buildArticleBody(
      title,
      fullText,
      sourceLabel,
      'iraq',
      category,
      governorate
    );

    const mergedParagraphs =
      rawLines.length > 1
        ? [...rawLines, paragraphs[paragraphs.length - 1]]
        : paragraphs;

    const idHash = crypto
      .createHash('md5')
      .update(`tg:${feed.defaultSourceId}:${dataPost || title}`)
      .digest('hex')
      .slice(0, 10);

    const tgPhoto = extractTelegramImage(block);

    results.push({
      id: `tg-${idHash}`,
      region: 'iraq',
      sourceId: feed.defaultSourceId,
      sourceName: sourceLabel,
      governorate,
      category,
      timeAgo: formatRelativeArabicTime(publishedAt),
      publishedAt,
      readTime: 'دقيقة واحدة',
      imageUrl: tgPhoto || pickLocalImage('iraq', category, i),
      hasArticleImage: Boolean(tgPhoto),
      title,
      summary,
      highlights,
      paragraphs: mergedParagraphs,
      externalUrl,
    });
  }

  return { articles: results, oldestPostNumber };
}

let cachedNewsPayload: { articles: NewsArticle[]; fetchedAt: number } | null = null;
let inFlightFetch: Promise<NewsArticle[]> | null = null;
let knownArticleIds = new Set<string>();

type LiveNewsListener = (payload: {
  newArticles: NewsArticle[];
  articles: NewsArticle[];
  fetchedAt: number;
}) => void;

const listeners = new Set<LiveNewsListener>();

export function subscribeToLiveNews(listener: LiveNewsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSubscriberCount(): number {
  return listeners.size;
}

function selectPerSourceAndSort(collected: NewsArticle[], now: number): NewsArticle[] {
  // Sort globally newest-first before deduplicating so newest entries win
  collected.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));

  const seenNorm = new Set<string>();
  const deduped: NewsArticle[] = [];

  for (const art of collected) {
    const norm = art.title.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '').slice(0, 60);
    if (!norm || seenNorm.has(norm)) continue;
    seenNorm.add(norm);
    deduped.push(art);
  }

  // Group by sourceId so EVERY source keeps at least MIN_PER_SOURCE (15+) newest articles,
  // plus ALL articles within the last 24 hours (up to MAX_PER_SOURCE per source)
  const bySource = new Map<string, NewsArticle[]>();
  for (const art of deduped) {
    const list = bySource.get(art.sourceId) ?? [];
    list.push(art);
    bySource.set(art.sourceId, list);
  }

  const selected: NewsArticle[] = [];
  for (const [, list] of bySource.entries()) {
    const within24h = list.filter((a) => now - (a.publishedAt ?? 0) <= TWENTY_FOUR_HOURS_MS);
    const keepCount = Math.min(
      MAX_PER_SOURCE,
      Math.max(MIN_PER_SOURCE, within24h.length)
    );
    selected.push(...list.slice(0, keepCount));
  }

  selected.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
  return selected.map((a) => ({
    ...a,
    timeAgo: a.publishedAt ? formatRelativeArabicTime(a.publishedAt) : a.timeAgo,
  }));
}

async function fetchSingleFeed(feed: FeedConfig, now: number, includeOlderPage = false): Promise<NewsArticle[]> {
  const res = await fetch(feed.url, {
    signal: AbortSignal.timeout(5500),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; IraqWorldNewsBot/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml, text/html',
    },
  });
  if (!res.ok) return [];
  const body = await res.text();
  if (feed.type !== 'telegram') {
    return parseRssItems(feed, body, now);
  }

  const page1 = parseTelegramItems(feed, body, now);
  if (!includeOlderPage || !page1.oldestPostNumber || page1.oldestPostNumber <= 2) {
    return page1.articles;
  }

  try {
    const olderRes = await fetch(`${feed.url}?before=${page1.oldestPostNumber}`, {
      signal: AbortSignal.timeout(4500),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IraqWorldNewsBot/1.0)',
        Accept: 'text/html',
      },
    });
    if (!olderRes.ok) return page1.articles;
    const olderHtml = await olderRes.text();
    const page2 = parseTelegramItems(feed, olderHtml, now);
    return [...page1.articles, ...page2.articles];
  } catch {
    return page1.articles;
  }
}

export async function pollPriorityTelegramChannels(): Promise<NewsArticle[]> {
  const now = Date.now();
  const tgFeeds = FEEDS.filter((f) => f.type === 'telegram');
  const settled = await Promise.allSettled(tgFeeds.map((feed) => fetchSingleFeed(feed, now, false)));

  const incoming: NewsArticle[] = [];
  for (const outcome of settled) {
    if (outcome.status === 'fulfilled') {
      incoming.push(...outcome.value);
    }
  }
  if (incoming.length === 0) return [];

  const hadPriorSnapshot = knownArticleIds.size > 0;
  const fresh: NewsArticle[] = [];

  for (const art of incoming) {
    if (!knownArticleIds.has(art.id)) {
      fresh.push(art);
    }
  }

  if (fresh.length === 0) return [];

  const mergedBase = [...fresh, ...(cachedNewsPayload?.articles ?? [])];
  const updated = selectPerSourceAndSort(mergedBase, now);
  knownArticleIds = new Set([...knownArticleIds, ...updated.map((a) => a.id)]);
  const fetchedAt = Date.now();
  cachedNewsPayload = {
    articles: updated,
    fetchedAt,
  };

  if (hadPriorSnapshot && listeners.size > 0) {
    for (const listener of listeners) {
      try {
        listener({ newArticles: fresh, articles: updated, fetchedAt });
      } catch {
        // Ignore closed listener
      }
    }
  }

  return fresh;
}

export async function getLast24HoursNews(forceRefresh = false): Promise<{
  articles: NewsArticle[];
  fetchedAt: number;
  newArticles: NewsArticle[];
}> {
  const now = Date.now();
  if (!forceRefresh && cachedNewsPayload && now - cachedNewsPayload.fetchedAt < CACHE_TTL_MS) {
    return {
      articles: cachedNewsPayload.articles.map((a) => ({
        ...a,
        timeAgo: a.publishedAt ? formatRelativeArabicTime(a.publishedAt) : a.timeAgo,
      })),
      fetchedAt: cachedNewsPayload.fetchedAt,
      newArticles: [],
    };
  }

  if (inFlightFetch && !forceRefresh) {
    const articles = await inFlightFetch;
    return { articles, fetchedAt: cachedNewsPayload?.fetchedAt ?? now, newArticles: [] };
  }

  const hadPriorSnapshot = knownArticleIds.size > 0;
  let detectedNew: NewsArticle[] = [];

  inFlightFetch = (async () => {
    const settled = await Promise.allSettled(
      FEEDS.map((feed) => fetchSingleFeed(feed, now, feed.type === 'telegram'))
    );

    const collected: NewsArticle[] = [];
    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        collected.push(...outcome.value);
      }
    }

    const selected = selectPerSourceAndSort(collected, now);

    // Enrich top direct articles with high-res og:image (capped at 1.6s so API stays snappy)
    await Promise.race([
      enrichDirectArticleImages(selected, 18),
      new Promise<void>((resolve) => setTimeout(resolve, 1600)),
    ]);

    if (hadPriorSnapshot) {
      detectedNew = selected.filter((a) => !knownArticleIds.has(a.id));
    }
    knownArticleIds = new Set(selected.map((a) => a.id));

    const fetchedAt = Date.now();
    cachedNewsPayload = {
      articles: selected,
      fetchedAt,
    };

    if (detectedNew.length > 0 && listeners.size > 0) {
      for (const listener of listeners) {
        try {
          listener({ newArticles: detectedNew, articles: selected, fetchedAt });
        } catch {
          // Ignore closed listener
        }
      }
    }

    return selected;
  })();

  try {
    const articles = await inFlightFetch;
    return {
      articles,
      fetchedAt: cachedNewsPayload?.fetchedAt ?? now,
      newArticles: detectedNew,
    };
  } finally {
    inFlightFetch = null;
  }
}

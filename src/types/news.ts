export type TabId = 'iraq' | 'world' | 'sports' | 'tech' | 'saved';

export type SourceGroup = 'iraqi_tv' | 'iraqi_press' | 'social_iraq' | 'intl_iraq' | 'world' | 'sports' | 'tech';

export interface NewsSource {
  id: string;
  name: string;
  group: SourceGroup;
  accentText: string;
}

export interface NewsArticle {
  id: string;
  region: 'iraq' | 'world' | 'sports' | 'tech';
  sourceId: string;
  sourceName?: string;
  governorate?: string;
  category: string;
  timeAgo: string;
  publishedAt?: number;
  readTime: string;
  imageUrl: string;
  hasArticleImage?: boolean;
  title: string;
  summary: string;
  highlights: string[];
  paragraphs: string[];
  externalUrl?: string;
}

export interface IraqFilters {
  sourceType: 'all' | 'iraqi_tv' | 'iraqi_press' | 'social_iraq' | 'intl_iraq';
  specificSource: string;
  governorate: string;
  topic: string;
}

export interface FootballMatch {
  id: string;
  league: string;
  date: string;
  state: 'in' | 'post' | 'pre';
  statusLabel: string;
  homeName: string;
  homeLogo?: string;
  homeFallbackLogo?: string;
  homeScore: string;
  awayName: string;
  awayLogo?: string;
  awayFallbackLogo?: string;
  awayScore: string;
  winner?: 'home' | 'away' | 'draw';
  isInternational?: boolean;
}

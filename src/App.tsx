import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Bookmark, ChevronDown, Cpu, Globe, Loader2, Trophy } from 'lucide-react';
import { ArticleModal } from './components/ArticleModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { BottomNav } from './components/BottomNav';
import { FilterDrawer } from './components/FilterDrawer';
import { Header } from './components/Header';
import { IraqFlag } from './components/IraqFlag';
import { MatchResultsBar } from './components/MatchResultsBar';
import { NewsCard } from './components/NewsCard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SettingsModal } from './components/SettingsModal';
import {
  getSource,
  HERITAGE_BACKDROPS,
  INITIAL_ARTICLES,
  REFRESH_POOL,
  SOURCES,
  SPORTS_CATEGORIES,
  TECH_CATEGORIES,
  WORLD_CATEGORIES,
} from './data/newsData';
import { FootballMatch, IraqFilters, NewsArticle, TabId } from './types/news';
import { SafeStore, STORAGE_KEYS } from './utils/storage';
import { useFemaleReader } from './utils/useFemaleReader';

function initArchive(): NewsArticle[] {
  const saved = SafeStore.get<NewsArticle[] | null>(STORAGE_KEYS.ARCHIVE, null);
  if (Array.isArray(saved) && saved.length > 0) {
    const seen = new Set<string>();
    const existing: NewsArticle[] = [];
    for (const item of saved) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        existing.push(item);
      }
    }
    const newSeeds: NewsArticle[] = [];
    for (const seed of INITIAL_ARTICLES) {
      if (!seen.has(seed.id)) {
        seen.add(seed.id);
        newSeeds.push(seed);
      }
    }
    const merged = [...newSeeds, ...existing];
    if (newSeeds.length > 0) {
      SafeStore.set(STORAGE_KEYS.ARCHIVE, merged);
    }
    return merged;
  }
  SafeStore.set(STORAGE_KEYS.ARCHIVE, INITIAL_ARTICLES);
  return [...INITIAL_ARTICLES];
}

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>(() => initArchive());
  const [activeTab, setActiveTab] = useState<TabId>('iraq');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<IraqFilters>({
    sourceType: 'all',
    specificSource: 'all',
    governorate: 'all',
    topic: 'all',
  });
  const [visibleLimits, setVisibleLimits] = useState<
    Record<'iraq' | 'world' | 'sports' | 'tech', number>
  >({
    iraq: 15,
    world: 15,
    sports: 15,
    tech: 15,
  });
  const [worldCat, setWorldCat] = useState('all');
  const [sportsCat, setSportsCat] = useState('all');
  const [techCat, setTechCat] = useState('all');
  const [query, setQuery] = useState('');
  const [isLoading24h, setIsLoading24h] = useState(true);
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesRefreshing, setMatchesRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>(() =>
    SafeStore.get<string[]>(STORAGE_KEYS.BOOKMARKS, [])
  );
  const [enabledSources, setEnabledSources] = useState<string[]>(() => {
    const allIds = SOURCES.map((s) => s.id);
    const saved = SafeStore.get<string[] | null>(STORAGE_KEYS.SOURCES, null);
    if (!saved) {
      SafeStore.set(STORAGE_KEYS.KNOWN_SOURCES, allIds);
      return allIds;
    }
    const known = SafeStore.get<string[]>(STORAGE_KEYS.KNOWN_SOURCES, saved);
    const newlyAdded = allIds.filter((id) => !known.includes(id));
    if (newlyAdded.length > 0) {
      const merged = Array.from(new Set([...saved, ...newlyAdded]));
      SafeStore.set(STORAGE_KEYS.SOURCES, merged);
      SafeStore.set(STORAGE_KEYS.KNOWN_SOURCES, allIds);
      return merged;
    }
    return saved;
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = SafeStore.get<string>(STORAGE_KEYS.THEME, 'dark');
    return savedTheme === 'dark';
  });
  const [fontIdx, setFontIdx] = useState<number>(() =>
    SafeStore.get<number>(STORAGE_KEYS.FONT, 1)
  );
  const [modalArticleId, setModalArticleId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStep, setRefreshStep] = useState(0);
  const [heritageIdx, setHeritageIdx] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toastTimerRef = useRef<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2600);
  }, []);

  const { audioState, playArticle, togglePause, nextChunk, stop } = useFemaleReader(showToast);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', isDark ? '#080C16' : '#f8fafc');
    }
    SafeStore.set(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeritageIdx((prev) => (prev + 1) % HERITAGE_BACKDROPS.length);
    }, 14000);
    return () => window.clearInterval(id);
  }, []);

  const merge24hArticles = useCallback((incoming: NewsArticle[], prev: NewsArticle[]): NewsArticle[] => {
    const byId = new Map<string, NewsArticle>();
    const seenNorm = new Set<string>();
    const result: NewsArticle[] = [];

    const all = [...incoming, ...prev];
    // Sort items with publishedAt newest-first while preserving seed order
    all.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));

    for (const item of all) {
      if (!item || !item.id || byId.has(item.id)) continue;
      const norm = item.title.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '').slice(0, 60);
      if (norm && seenNorm.has(norm)) continue;
      byId.set(item.id, item);
      if (norm) seenNorm.add(norm);
      result.push(item);
    }

    const topLive = result.slice(0, 140);
    const topIds = new Set(topLive.map((a) => a.id));
    const preservedSeeds = INITIAL_ARTICLES.filter((s) => !topIds.has(s.id));
    SafeStore.set(STORAGE_KEYS.ARCHIVE, [...topLive, ...preservedSeeds]);
    return result;
  }, []);

  useEffect(() => {
    let active = true;

    const syncLatestNews = async (silent = true) => {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) return;
        const data = (await res.json()) as { articles?: NewsArticle[] };
        if (!active || !Array.isArray(data.articles) || data.articles.length === 0) return;
        setArticles((prev) => merge24hArticles(data.articles!, prev));
      } catch {
        // Keep initial/cached articles on network hiccup
      } finally {
        if (active && !silent) setIsLoading24h(false);
      }
    };

    void syncLatestNews(false);

    let eventSource: EventSource | null = null;
    if (typeof EventSource !== 'undefined') {
      eventSource = new EventSource('/api/news/stream');
      eventSource.addEventListener('new_articles', (ev) => {
        if (!active) return;
        try {
          const payload = JSON.parse((ev as MessageEvent<string>).data) as {
            newArticles?: NewsArticle[];
          };
          const incoming = payload.newArticles;
          if (!Array.isArray(incoming) || incoming.length === 0) return;
          setArticles((prev) => merge24hArticles(incoming, prev));
          if (incoming.length === 1) {
            const first = incoming[0];
            const srcLabel = first.sourceName || getSource(first.sourceId).name;
            showToast(`خبر عاجل من ${srcLabel}: ${first.title.slice(0, 38)}...`);
          } else {
            showToast(`وصل الآن ${incoming.length} أخبار جديدة فور نزولها`);
          }
        } catch {
          // Ignore malformed SSE frame
        }
      });
    }

    const fallbackInterval = window.setInterval(() => {
      void syncLatestNews(true);
    }, 45_000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void syncLatestNews(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      eventSource?.close();
      window.clearInterval(fallbackInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [merge24hArticles, showToast]);

  const loadMatches = useCallback(async (force = false) => {
    if (force) setMatchesRefreshing(true);
    try {
      const res = await fetch(force ? '/api/sports/matches?force=1' : '/api/sports/matches');
      if (!res.ok) return;
      const data = (await res.json()) as { matches?: FootballMatch[] };
      if (Array.isArray(data.matches)) {
        setMatches(data.matches);
      }
    } catch {
      // Keep cached matches if offline
    } finally {
      setMatchesLoading(false);
      setMatchesRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMatches(false);
  }, [loadMatches]);

  useEffect(() => {
    if (activeTab !== 'sports') return;
    void loadMatches(false);
    const id = window.setInterval(() => {
      void loadMatches(false);
    }, 30_000);
    return () => window.clearInterval(id);
  }, [activeTab, loadMatches]);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 700);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filteredIraq = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (a.region !== 'iraq') return false;
      if (!enabledSources.includes(a.sourceId)) return false;

      const src = getSource(a.sourceId);
      if (filters.sourceType !== 'all' && src.group !== filters.sourceType) return false;
      if (filters.specificSource !== 'all' && a.sourceId !== filters.specificSource) return false;
      if (filters.governorate !== 'all' && a.governorate !== filters.governorate) return false;
      if (filters.topic !== 'all' && a.category !== filters.topic) return false;

      if (q) {
        const hay = `${a.title} ${a.summary} ${a.governorate || ''} ${a.category} ${a.sourceName || ''} ${src.name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [articles, enabledSources, filters, query]);

  const filteredWorld = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (a.region !== 'world') return false;
      if (!enabledSources.includes(a.sourceId)) return false;
      if (worldCat !== 'all' && a.category !== worldCat) return false;
      if (q && !`${a.title} ${a.summary} ${a.category} ${a.sourceName || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [articles, enabledSources, worldCat, query]);

  const filteredSports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const isSportsItem =
        a.region === 'sports' || a.category === 'رياضة عراقية' || a.category === 'رياضة عالمية';
      if (!isSportsItem) return false;

      if (sportsCat !== 'all') {
        const matchesDirect = a.category === sportsCat;
        const matchesIraq = sportsCat === 'كرة القدم العراقية' && a.category === 'رياضة عراقية';
        const matchesGlobal = sportsCat === 'بطولات عالمية' && a.category === 'رياضة عالمية';
        if (!matchesDirect && !matchesIraq && !matchesGlobal) return false;
      }

      if (q && !`${a.title} ${a.summary} ${a.category} ${a.sourceName || ''}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [articles, sportsCat, query]);

  const filteredTech = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (a.region !== 'tech') return false;
      if (techCat !== 'all' && a.category !== techCat) return false;
      if (q && !`${a.title} ${a.summary} ${a.category} ${a.sourceName || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [articles, techCat, query]);

  const savedArticles = useMemo(
    () => articles.filter((a) => bookmarks.includes(a.id)),
    [articles, bookmarks]
  );

  const currentFilteredLength =
    activeTab === 'iraq'
      ? filteredIraq.length
      : activeTab === 'world'
      ? filteredWorld.length
      : activeTab === 'sports'
      ? filteredSports.length
      : activeTab === 'tech'
      ? filteredTech.length
      : 0;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || activeTab === 'saved') return;

    const currentLimit = visibleLimits[activeTab];
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && currentLimit < currentFilteredLength) {
          setVisibleLimits((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab] + 15,
          }));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeTab, visibleLimits, currentFilteredLength]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.sourceType !== 'all') count++;
    if (filters.specificSource !== 'all') count++;
    if (filters.governorate !== 'all') count++;
    if (filters.topic !== 'all') count++;
    return count;
  }, [filters]);

  const handleFilterChange = useCallback(
    <K extends keyof IraqFilters>(key: K, val: IraqFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: val }));
    },
    []
  );

  const resetIraqFilters = useCallback(() => {
    setFilters({
      sourceType: 'all',
      specificSource: 'all',
      governorate: 'all',
      topic: 'all',
    });
    setQuery('');
  }, []);

  const handleToggleBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => {
        const exists = prev.includes(id);
        const next = exists ? prev.filter((x) => x !== id) : [id, ...prev];
        SafeStore.set(STORAGE_KEYS.BOOKMARKS, next);
        showToast(exists ? 'تمت إزالة الخبر من المحفوظات' : 'تم حفظ الخبر في المحفوظات');
        return next;
      });
    },
    [showToast]
  );

  const handleClearSaved = useCallback(() => {
    setBookmarks([]);
    SafeStore.set(STORAGE_KEYS.BOOKMARKS, []);
    showToast('تم مسح المحفوظات');
  }, [showToast]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      const res = await fetch('/api/news?force=1');
      if (res.ok) {
        const data = (await res.json()) as { articles?: NewsArticle[] };
        if (Array.isArray(data.articles) && data.articles.length > 0) {
          setArticles((prev) => merge24hArticles(data.articles!, prev));
          setHeritageIdx((prev) => (prev + 1) % HERITAGE_BACKDROPS.length);
          setIsRefreshing(false);
          showToast(`تم تحديث أخبار آخر 24 ساعة · ${data.articles.length} خبر من المصادر`);
          return;
        }
      }
    } catch {
      // Fallback below
    }

    const pack = REFRESH_POOL[refreshStep % REFRESH_POOL.length];
    const nextStep = refreshStep + 1;
    const stamp = `${Date.now()}-${nextStep}`;

    const newIraq: NewsArticle = {
      ...pack.iraq,
      id: `iq-live-${stamp}`,
      timeAgo: 'الآن',
      publishedAt: Date.now(),
    };
    const newTech: NewsArticle = {
      ...pack.tech,
      id: `tc-live-${stamp}`,
      timeAgo: 'الآن',
      publishedAt: Date.now(),
    };

    setArticles((prev) => merge24hArticles([newIraq, newTech], prev));
    setRefreshStep(nextStep);
    setHeritageIdx((prev) => (prev + 1) % HERITAGE_BACKDROPS.length);
    setIsRefreshing(false);
    showToast(`تم التحديث · خبر جديد من ${getSource(newIraq.sourceId).name}`);
  }, [isRefreshing, merge24hArticles, refreshStep, showToast]);

  const handleFontChange = useCallback((delta: number) => {
    setFontIdx((prev) => {
      const next = Math.max(0, Math.min(2, prev + delta));
      SafeStore.set(STORAGE_KEYS.FONT, next);
      return next;
    });
  }, []);

  const handleToggleSource = useCallback(
    (sourceId: string) => {
      setEnabledSources((prev) => {
        if (prev.includes(sourceId) && prev.length <= 1) {
          showToast('يجب الإبقاء على مصدر واحد على الأقل');
          return prev;
        }
        const next = prev.includes(sourceId)
          ? prev.filter((x) => x !== sourceId)
          : [...prev, sourceId];
        SafeStore.set(STORAGE_KEYS.SOURCES, next);
        return next;
      });
    },
    [showToast]
  );

  const handleSelectAllSources = useCallback(() => {
    const all = SOURCES.map((s) => s.id);
    setEnabledSources(all);
    SafeStore.set(STORAGE_KEYS.SOURCES, all);
    showToast('تم تفعيل جميع المصادر الإخبارية');
  }, [showToast]);

  const handleSelectIraqOnly = useCallback(() => {
    const iraqOnly = SOURCES.filter(
      (s) => s.group !== 'intl_iraq' && s.group !== 'world'
    ).map((s) => s.id);
    setEnabledSources(iraqOnly);
    SafeStore.set(STORAGE_KEYS.SOURCES, iraqOnly);
    showToast('تم تفعيل المصادر العراقية والتقنية فقط');
  }, [showToast]);

  const handleResetArchive = useCallback(() => {
    const fresh = [...INITIAL_ARTICLES];
    setArticles(fresh);
    setVisibleLimits({ iraq: 15, world: 15, sports: 15, tech: 15 });
    SafeStore.set(STORAGE_KEYS.ARCHIVE, fresh);
    showToast('تمت إعادة ضبط أرشيف الأخبار');
  }, [showToast]);

  const handleShareArticle = useCallback(
    async (article: NewsArticle) => {
      const text = `${article.title}\n\n${article.summary}\n\nعبر تطبيق أخبار العراق والعالم`;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        showToast('تم نسخ نص الخبر للمشاركة');
      } catch {
        showToast('تم تجهيز نص الخبر للمشاركة');
      }
    },
    [showToast]
  );

  const handleTestAudio = useCallback(() => {
    playArticle({
      id: 'audio-diagnostic',
      region: 'iraq',
      sourceId: 'ina',
      category: 'إعدادات',
      timeAgo: 'الآن',
      readTime: 'اختبار',
      imageUrl: HERITAGE_BACKDROPS[0],
      title: 'اختبار قارئ الأخبار الصوتي النسائي',
      summary: 'اختبار جودة القراءة الصوتية المتصلة',
      highlights: [],
      paragraphs: [
        'مرحباً بك في تطبيق أخبار العراق والعالم.',
        'قارئ الأخبار الصوتي يعمل الآن بكفاءة عالية لقراءة جميع المقالات كاملة من البداية وحتى النهاية دون انقطاع.',
      ],
    });
  }, [playArticle]);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const modalArticle = useMemo(
    () => articles.find((a) => a.id === modalArticleId) ?? null,
    [articles, modalArticleId]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C16] text-slate-900 dark:text-slate-100 pb-24 lg:pb-12 transition-colors duration-200">
      <Header
        query={query}
        onQueryChange={setQuery}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenSettings={() => setSettingsOpen(true)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        savedCount={bookmarks.length}
      />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5">
        {isRefreshing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse lg:col-span-2" />
            <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        ) : (
          <>
            {/* القسم الأول: أخبار العراق أولاً بأول */}
            {activeTab === 'iraq' && (
              <section className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <img
                    src={HERITAGE_BACKDROPS[heritageIdx]}
                    alt="معالم وتراث العراق"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none transition-opacity duration-700"
                  />
                  <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                        <span className="font-extrabold text-rose-600 dark:text-rose-400">
                          مباشر فور نزول الخبر
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {isLoading24h ? 'جاري جلب أخبار المصادر...' : `${filteredIraq.length} خبر من المصادر`}
                        </span>
                      </div>
                      <h1 className="font-display font-black text-lg sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2.5">
                        <IraqFlag className="w-7 h-4.5" />
                        <span className="truncate">أخبار العراق أولاً بأول</span>
                      </h1>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFiltersOpen((prev) => !prev)}
                      aria-expanded={filtersOpen}
                      className="h-11 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer transition-colors"
                    >
                      <span>تصفية الأخبار</span>
                      {activeFilterCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-black tabular-nums">
                          {activeFilterCount}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          filtersOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <FilterDrawer
                  isOpen={filtersOpen}
                  filters={filters}
                  enabledSources={enabledSources}
                  onChangeFilter={handleFilterChange}
                  onReset={resetIraqFilters}
                />

                {filteredIraq.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
                    <p className="font-display font-bold text-base">
                      لا توجد أخبار مطابقة لخيارات الفلترة الحالية
                    </p>
                    <button
                      type="button"
                      onClick={resetIraqFilters}
                      className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                    >
                      عرض كل أخبار العراق
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredIraq.slice(0, visibleLimits.iraq).map((art, idx) => (
                        <NewsCard
                          key={art.id}
                          article={art}
                          isFeatured={idx === 0}
                          isBookmarked={bookmarks.includes(art.id)}
                          isSpeaking={audioState.activeId === art.id}
                          onOpen={setModalArticleId}
                          onToggleBookmark={handleToggleBookmark}
                          onSpeak={playArticle}
                        />
                      ))}
                    </div>

                    {visibleLimits.iraq < filteredIraq.length && (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleLimits((prev) => ({ ...prev, iraq: prev.iraq + 15 }))
                          }
                          className="h-11 px-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer hover:border-emerald-500"
                        >
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                          <span>
                            عرض المزيد من أخبار الـ 24 ساعة ({Math.min(visibleLimits.iraq, filteredIraq.length)} / {filteredIraq.length})
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* القسم الثاني: أخبار العالم */}
            {activeTab === 'world' && (
              <section className="space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        تغطية دولية شاملة · آخر 24 ساعة
                      </p>
                      <h1 className="font-display font-black text-lg sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                        <Globe className="w-5 h-5 text-sky-500" aria-hidden="true" />
                        <span>أخبار العالم</span>
                      </h1>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                      {filteredWorld.length} خبر
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    <button
                      type="button"
                      onClick={() => setWorldCat('all')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        worldCat === 'all'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      الكل
                    </button>
                    {WORLD_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setWorldCat(cat)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                          worldCat === cat
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredWorld.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm font-bold text-slate-500">
                    لا توجد أخبار عالمية مطابقة لبحثك
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredWorld.slice(0, visibleLimits.world).map((art, idx) => (
                        <NewsCard
                          key={art.id}
                          article={art}
                          isFeatured={idx === 0}
                          isBookmarked={bookmarks.includes(art.id)}
                          isSpeaking={audioState.activeId === art.id}
                          onOpen={setModalArticleId}
                          onToggleBookmark={handleToggleBookmark}
                          onSpeak={playArticle}
                        />
                      ))}
                    </div>

                    {visibleLimits.world < filteredWorld.length && (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleLimits((prev) => ({ ...prev, world: prev.world + 15 }))
                          }
                          className="h-11 px-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer hover:border-sky-500"
                        >
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
                          <span>
                            عرض المزيد من أخبار العالم ({Math.min(visibleLimits.world, filteredWorld.length)} / {filteredWorld.length})
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* القسم الثالث: الرياضة */}
            {activeTab === 'sports' && (
              <section className="space-y-4">
                <MatchResultsBar
                  matches={matches}
                  isLoading={matchesLoading}
                  isRefreshing={matchesRefreshing}
                  onRefresh={() => void loadMatches(true)}
                />

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        دوري نجوم العراق · الأبطال · البطولات العالمية · مباشر
                      </p>
                      <h1 className="font-display font-black text-lg sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                        <Trophy className="w-5 h-5 text-amber-500" aria-hidden="true" />
                        <span>أخبار الرياضة</span>
                      </h1>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                      {filteredSports.length} خبر
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    <button
                      type="button"
                      onClick={() => setSportsCat('all')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        sportsCat === 'all'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      الكل
                    </button>
                    {SPORTS_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSportsCat(cat)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                          sportsCat === cat
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSports.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm font-bold text-slate-500">
                    لا توجد أخبار رياضية مطابقة لبحثك
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSports.slice(0, visibleLimits.sports).map((art, idx) => (
                        <NewsCard
                          key={art.id}
                          article={art}
                          isFeatured={idx === 0}
                          isBookmarked={bookmarks.includes(art.id)}
                          isSpeaking={audioState.activeId === art.id}
                          onOpen={setModalArticleId}
                          onToggleBookmark={handleToggleBookmark}
                          onSpeak={playArticle}
                        />
                      ))}
                    </div>

                    {visibleLimits.sports < filteredSports.length && (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleLimits((prev) => ({ ...prev, sports: prev.sports + 15 }))
                          }
                          className="h-11 px-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer hover:border-amber-500"
                        >
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                          <span>
                            عرض المزيد من أخبار الرياضة ({Math.min(visibleLimits.sports, filteredSports.length)} / {filteredSports.length})
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* القسم الرابع: التكنولوجيا */}
            {activeTab === 'tech' && (
              <section className="space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        ألعاب · علوم · فضاء · ذكاء اصطناعي · آخر 24 ساعة
                      </p>
                      <h1 className="font-display font-black text-xl sm:text-2xl flex items-center gap-2 mt-0.5">
                        <Cpu className="w-5 h-5 text-purple-500" aria-hidden="true" />
                        <span className="tech-connected-rainbow">التكنولوجيا</span>
                      </h1>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                      {filteredTech.length} خبر
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    <button
                      type="button"
                      onClick={() => setTechCat('all')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        techCat === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      الكل
                    </button>
                    {TECH_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTechCat(cat)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                          techCat === cat
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredTech.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm font-bold text-slate-500">
                    لا توجد أخبار تقنية مطابقة لبحثك
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTech.slice(0, visibleLimits.tech).map((art, idx) => (
                        <NewsCard
                          key={art.id}
                          article={art}
                          isFeatured={idx === 0}
                          isBookmarked={bookmarks.includes(art.id)}
                          isSpeaking={audioState.activeId === art.id}
                          onOpen={setModalArticleId}
                          onToggleBookmark={handleToggleBookmark}
                          onSpeak={playArticle}
                        />
                      ))}
                    </div>

                    {visibleLimits.tech < filteredTech.length && (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleLimits((prev) => ({ ...prev, tech: prev.tech + 15 }))
                          }
                          className="h-11 px-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer hover:border-purple-500"
                        >
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
                          <span>
                            عرض المزيد من أخبار التكنولوجيا ({Math.min(visibleLimits.tech, filteredTech.length)} / {filteredTech.length})
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {activeTab !== 'saved' && <div ref={sentinelRef} className="h-4" />}

            {/* القسم الرابع: المحفوظات */}
            {activeTab === 'saved' && (
              <section className="space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-3">
                  <div>
                    <h1 className="font-display font-black text-lg sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      <span>المحفوظات</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      الأخبار المحفوظة في ذاكرة جهازك للقراءة لاحقاً
                    </p>
                  </div>

                  {savedArticles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSaved}
                      className="h-10 px-3.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 dark:text-rose-300 cursor-pointer"
                    >
                      مسح الكل
                    </button>
                  )}
                </div>

                {savedArticles.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-3">
                    <Bookmark className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
                    <p className="font-display font-bold text-base text-slate-900 dark:text-white">
                      قائمة المحفوظات فارغة
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      اضغط على أيقونة الحفظ في أي بطاقة خبر للاحتفاظ به هنا
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTabChange('iraq')}
                      className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      تصفح أخبار العراق
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedArticles.map((art) => (
                      <NewsCard
                        key={art.id}
                        article={art}
                        isBookmarked={true}
                        isSpeaking={audioState.activeId === art.id}
                        onOpen={setModalArticleId}
                        onToggleBookmark={handleToggleBookmark}
                        onSpeak={playArticle}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <AudioPlayerBar
        audioState={audioState}
        onTogglePause={togglePause}
        onNextChunk={nextChunk}
        onStop={stop}
      />

      <BottomNav
        activeTab={activeTab}
        savedCount={bookmarks.length}
        onTabChange={handleTabChange}
      />

      <ArticleModal
        article={modalArticle}
        fontIdx={fontIdx}
        isBookmarked={modalArticle ? bookmarks.includes(modalArticle.id) : false}
        isSpeaking={modalArticle ? audioState.activeId === modalArticle.id : false}
        onClose={() => setModalArticleId(null)}
        onFontChange={handleFontChange}
        onSpeak={playArticle}
        onToggleBookmark={handleToggleBookmark}
        onShare={handleShareArticle}
      />

      <SettingsModal
        isOpen={settingsOpen}
        isDark={isDark}
        fontIdx={fontIdx}
        voiceLabel={audioState.voiceLabel}
        isTestingAudio={audioState.activeId === 'audio-diagnostic'}
        enabledSources={enabledSources}
        archiveCount={articles.length}
        onClose={() => setSettingsOpen(false)}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onFontChange={handleFontChange}
        onTestAudio={handleTestAudio}
        onToggleSource={handleToggleSource}
        onSelectAllSources={handleSelectAllSources}
        onSelectIraqOnlySources={handleSelectIraqOnly}
        onResetArchive={handleResetArchive}
      />

      {showScrollTop && !audioState.activeId && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="العودة للأعلى"
          title="العودة للأعلى"
          className="fixed bottom-20 lg:bottom-6 left-4 z-30 w-11 h-11 rounded-full bg-slate-900/90 dark:bg-slate-800/95 text-white border border-slate-700 shadow-lg flex items-center justify-center cursor-pointer hover:bg-emerald-600 transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      <OfflineIndicator />

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold border border-slate-700 shadow-lg whitespace-nowrap"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}

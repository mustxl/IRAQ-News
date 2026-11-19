export const STORAGE_KEYS = {
  ARCHIVE: 'iraq_world_news_archive_v5',
  BOOKMARKS: 'iraq_world_news_bookmarks_v5',
  SOURCES: 'iraq_world_news_sources_v5',
  KNOWN_SOURCES: 'iraq_world_news_known_sources_v5',
  THEME: 'iraq_world_news_theme_v5',
  FONT: 'iraq_world_news_font_v5',
} as const;

export const SafeStore = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, val: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch {
      try {
        if (Array.isArray(val) && val.length > 40) {
          window.localStorage.setItem(key, JSON.stringify(val.slice(0, 40)));
        }
      } catch {
        // Ignore quota failure
      }
    }
  },
};

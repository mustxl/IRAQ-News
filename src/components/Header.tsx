import { RefreshCw, Search, Settings } from 'lucide-react';
import { TabId } from '../types/news';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  query: string;
  onQueryChange: (val: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSettings: () => void;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  savedCount: number;
}

export function Header({
  query,
  onQueryChange,
  onRefresh,
  isRefreshing,
  onOpenSettings,
  activeTab,
  onTabChange,
  savedCount,
}: HeaderProps) {
  const navItems: Array<{ id: TabId; label: string; isTech?: boolean }> = [
    { id: 'iraq', label: 'العراق' },
    { id: 'world', label: 'العالم' },
    { id: 'sports', label: 'الرياضة' },
    { id: 'tech', label: 'التكنولوجيا', isTech: true },
    { id: 'saved', label: savedCount > 0 ? `المحفوظات (${savedCount})` : 'المحفوظات' },
  ];

  return (
    <header className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] bg-white/95 dark:bg-[#080C16]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-5">
        {/* Tablet Landscape & Desktop Brand + Nav Links */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          <button
            type="button"
            onClick={() => onTabChange('iraq')}
            className="font-display font-black text-base text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            أخبار العراق والعالم
          </button>

          <nav className="flex items-center gap-5 text-sm font-medium" aria-label="الأقسام الرئيسية">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                    active
                      ? 'border-rose-600 text-slate-900 dark:text-white font-bold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.isTech ? (
                    <span className="font-display font-black tech-connected-rainbow">{item.label}</span>
                  ) : (
                    item.label
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Instant Search */}
        <div className="relative flex-1 min-w-0 max-w-md">
          <Search
            className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="ابحث في الأخبار..."
            aria-label="ابحث في الأخبار"
            className="w-full h-10 pr-9 pl-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 transition-colors"
          />
        </div>

        {/* Actions: Install App + Refresh + Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <PWAInstallButton variant="header" />

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-10 px-2.5 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
            title="تحديث الأخبار أولاً بأول"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="hidden xs:inline sm:inline">تحديث</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="الإعدادات وضبط المصادر"
            title="الإعدادات وضبط المصادر"
            className="w-10 sm:w-11 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

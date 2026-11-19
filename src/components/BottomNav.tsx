import { Bookmark, Cpu, Globe, Trophy } from 'lucide-react';
import { TabId } from '../types/news';
import { IraqFlag } from './IraqFlag';

interface BottomNavProps {
  activeTab: TabId;
  savedCount: number;
  onTabChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, savedCount, onTabChange }: BottomNavProps) {
  return (
    <nav
      aria-label="التنقل السفلي"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] bg-white/95 dark:bg-[#080C16]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
    >
      <div className="h-16 max-w-2xl mx-auto grid grid-cols-5">
        <button
          type="button"
          onClick={() => onTabChange('iraq')}
          className={`relative flex flex-col items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
            activeTab === 'iraq'
              ? 'text-rose-600 dark:text-rose-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          {activeTab === 'iraq' && (
            <span className="absolute top-0 w-8 h-1 rounded-b-full bg-rose-600" />
          )}
          <IraqFlag className="w-5 h-3.5" />
          <span className="text-[11px]">العراق</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('world')}
          className={`relative flex flex-col items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
            activeTab === 'world'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          {activeTab === 'world' && (
            <span className="absolute top-0 w-8 h-1 rounded-b-full bg-sky-500" />
          )}
          <Globe className="w-5 h-5" aria-hidden="true" />
          <span className="text-[11px]">العالم</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('sports')}
          className={`relative flex flex-col items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
            activeTab === 'sports'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          {activeTab === 'sports' && (
            <span className="absolute top-0 w-8 h-1 rounded-b-full bg-amber-500" />
          )}
          <Trophy className="w-5 h-5" aria-hidden="true" />
          <span className="text-[11px]">الرياضة</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('tech')}
          className={`relative flex flex-col items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
            activeTab === 'tech'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-bold'
          }`}
        >
          {activeTab === 'tech' && (
            <span className="absolute top-0 w-9 h-1 rounded-b-full bg-purple-500" />
          )}
          <Cpu className="w-5 h-5 text-purple-500" aria-hidden="true" />
          <span className="text-[11px] font-display font-black tech-connected-rainbow">
            التكنولوجيا
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('saved')}
          className={`relative flex flex-col items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
            activeTab === 'saved'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          {activeTab === 'saved' && (
            <span className="absolute top-0 w-9 h-1 rounded-b-full bg-emerald-600" />
          )}
          <div className="relative">
            <Bookmark
              className="w-5 h-5"
              fill={activeTab === 'saved' ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -left-2.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center tabular-nums">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[11px]">المحفوظات</span>
        </button>
      </div>
    </nav>
  );
}

import { IRAQ_GOVERNORATES, IRAQ_TOPICS, SOURCES } from '../data/newsData';
import { IraqFilters } from '../types/news';

interface FilterDrawerProps {
  isOpen: boolean;
  filters: IraqFilters;
  enabledSources: string[];
  onChangeFilter: <K extends keyof IraqFilters>(key: K, val: IraqFilters[K]) => void;
  onReset: () => void;
}

export function FilterDrawer({
  isOpen,
  filters,
  enabledSources,
  onChangeFilter,
  onReset,
}: FilterDrawerProps) {
  const iraqiSources = SOURCES.filter((s) => {
    if (s.group === 'world' || s.group === 'sports' || s.group === 'tech') return false;
    if (!enabledSources.includes(s.id)) return false;
    if (filters.sourceType !== 'all' && s.group !== filters.sourceType) return false;
    return true;
  });

  const sourceGroups: Array<{ id: IraqFilters['sourceType']; label: string }> = [
    { id: 'all', label: 'الكل' },
    { id: 'iraqi_tv', label: 'قنوات ووكالات عراقية' },
    { id: 'iraqi_press', label: 'جرائد عراقية' },
    { id: 'social_iraq', label: 'قنوات تيليغرام العراقية' },
    { id: 'intl_iraq', label: 'تغطية دولية للعراق' },
  ];

  return (
    <div className={`filter-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
      <div className="filter-drawer-inner">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          {/* 1. نوع المصدر */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {sourceGroups.map((g) => {
              const active = filters.sourceType === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    onChangeFilter('sourceType', g.id);
                    onChangeFilter('specificSource', 'all');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          {/* 2. المصادر العراقية المحددة */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800 pt-2.5">
            <button
              type="button"
              onClick={() => onChangeFilter('specificSource', 'all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                filters.specificSource === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              الكل ({iraqiSources.length})
            </button>
            {iraqiSources.map((s) => {
              const active = filters.specificSource === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onChangeFilter('specificSource', s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>

          {/* 3. المحافظات العراقية */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800 pt-2.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 ml-1">المحافظة:</span>
            <button
              type="button"
              onClick={() => onChangeFilter('governorate', 'all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                filters.governorate === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              كل العراق
            </button>
            {IRAQ_GOVERNORATES.map((gov) => {
              const active = filters.governorate === gov;
              return (
                <button
                  key={gov}
                  type="button"
                  onClick={() => onChangeFilter('governorate', gov)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {gov}
                </button>
              );
            })}
          </div>

          {/* 4. الموضوع */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 ml-1">القسم:</span>
              <button
                type="button"
                onClick={() => onChangeFilter('topic', 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  filters.topic === 'all'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                الكل
              </button>
              {IRAQ_TOPICS.map((topic) => {
                const active = filters.topic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => onChangeFilter('topic', topic)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white whitespace-nowrap shrink-0 px-2 py-1 cursor-pointer"
            >
              إعادة ضبط
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';
import { FootballMatch } from '../types/news';

interface MatchResultsBarProps {
  matches: FootballMatch[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

function TeamCrest({ name, logo }: { name: string; logo?: string }) {
  const cleanLogo = logo?.trim() || '';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [cleanLogo]);

  if (!cleanLogo || failed) {
    const initial = name.trim().slice(0, 2);
    return (
      <span
        aria-hidden="true"
        className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0"
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={cleanLogo}
      alt={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-6 h-6 object-contain shrink-0"
    />
  );
}

export function MatchResultsBar({
  matches,
  isLoading,
  isRefreshing,
  onRefresh,
}: MatchResultsBarProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
          <h2 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
            نتائج آخر مباريات كرة القدم
          </h2>
          {matches.length > 0 && (
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
              · {matches.length} مباراة
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-8 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer hover:border-amber-500 transition-colors shrink-0 disabled:opacity-60"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          <span>تحديث النتائج</span>
        </button>
      </div>

      {isLoading && matches.length === 0 ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="min-w-[240px] sm:min-w-[258px] h-[116px] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0"
            />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400">
          لا توجد نتائج مباريات مسجلة حالياً — اضغط تحديث النتائج للمحاولة مجدداً.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
          {matches.map((m) => {
            const isLive = m.state === 'in';
            const homeWon = m.winner === 'home';
            const awayWon = m.winner === 'away';

            return (
              <div
                key={m.id}
                className={`min-w-[238px] sm:min-w-[258px] snap-start rounded-2xl bg-white dark:bg-slate-900 border p-3.5 shrink-0 flex flex-col justify-between gap-2.5 ${
                  isLive
                    ? 'border-emerald-500/70 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header: League & Status */}
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-bold text-slate-500 dark:text-slate-400 truncate">
                    {m.league}
                  </span>
                  <span
                    className={`font-extrabold shrink-0 tabular-nums ${
                      isLive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {m.statusLabel}
                  </span>
                </div>

                {/* Rectangular Match Scoreboard Rows */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <TeamCrest name={m.homeName} logo={m.homeLogo} />
                      <span
                        className={`text-xs sm:text-sm truncate ${
                          homeWon
                            ? 'font-black text-slate-900 dark:text-white'
                            : 'font-semibold text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m.homeName}
                      </span>
                    </div>
                    <span
                      className={`font-display font-black text-base tabular-nums shrink-0 min-w-[20px] text-left ${
                        homeWon
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {m.homeScore}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <TeamCrest name={m.awayName} logo={m.awayLogo} />
                      <span
                        className={`text-xs sm:text-sm truncate ${
                          awayWon
                            ? 'font-black text-slate-900 dark:text-white'
                            : 'font-semibold text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m.awayName}
                      </span>
                    </div>
                    <span
                      className={`font-display font-black text-base tabular-nums shrink-0 min-w-[20px] text-left ${
                        awayWon
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {m.awayScore}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

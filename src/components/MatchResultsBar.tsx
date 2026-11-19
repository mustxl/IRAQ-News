import { useEffect, useState } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';
import { FootballMatch } from '../types/news';

interface MatchResultsBarProps {
  matches: FootballMatch[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

function getShieldPalette(name: string): [string, string] {
  const palettes: Array<[string, string]> = [
    ['#047857', '#34d399'],
    ['#1d4ed8', '#60a5fa'],
    ['#b91c1c', '#fbbf24'],
    ['#7c3aed', '#c084fc'],
    ['#c2410c', '#fb923c'],
    ['#0f766e', '#2dd4bf'],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palettes[hash % palettes.length];
}

function TeamCrest({
  name,
  logo,
  fallbackLogo,
  isInternational,
}: {
  name: string;
  logo?: string;
  fallbackLogo?: string;
  isInternational?: boolean;
}) {
  const candidates = [logo?.trim(), fallbackLogo?.trim()].filter(
    (u, idx, arr): u is string => Boolean(u) && arr.indexOf(u) === idx
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [logo, fallbackLogo]);

  const activeUrl = candidates[idx];

  if (!activeUrl) {
    const [c1, c2] = getShieldPalette(name);
    const shortTag = name.trim().slice(0, 2);
    return (
      <span
        aria-hidden="true"
        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative"
      >
        {isInternational ? (
          <svg viewBox="0 0 28 20" className="w-5 h-4 rounded-[3px] shadow-2xs">
            <rect width="28" height="20" rx="2" fill={c1} />
            <rect y="7" width="28" height="6" fill="#ffffff" fillOpacity="0.88" />
            <circle cx="14" cy="10" r="3" fill={c2} />
          </svg>
        ) : (
          <svg viewBox="0 0 28 28" className="w-6 h-6">
            <path
              d="M14 2L24 6V14C24 20 19.6 24.4 14 26C8.4 24.4 4 20 4 14V6L14 2Z"
              fill={c1}
              stroke={c2}
              strokeWidth="1.6"
            />
            <text
              x="14"
              y="17"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="8.5"
              fontWeight="900"
              fontFamily="Cairo, sans-serif"
            >
              {shortTag}
            </text>
          </svg>
        )}
      </span>
    );
  }

  const isFlagUrl =
    activeUrl.includes('flagcdn.com') || activeUrl.includes('/countries/');

  return (
    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-200/95 border border-slate-200 dark:border-slate-700/50 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
      <img
        src={activeUrl}
        alt={name}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setIdx((prev) => prev + 1)}
        className={
          isFlagUrl
            ? 'w-full h-full object-cover rounded-[4px]'
            : 'w-full h-full object-contain'
        }
      />
    </span>
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
                      <TeamCrest
                        name={m.homeName}
                        logo={m.homeLogo}
                        fallbackLogo={m.homeFallbackLogo}
                        isInternational={m.isInternational}
                      />
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
                      <TeamCrest
                        name={m.awayName}
                        logo={m.awayLogo}
                        fallbackLogo={m.awayFallbackLogo}
                        isInternational={m.isInternational}
                      />
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

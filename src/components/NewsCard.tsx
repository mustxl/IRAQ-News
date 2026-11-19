import { useEffect, useState } from 'react';
import { Bookmark, Volume2 } from 'lucide-react';
import { buildCardFallbackSvg, getSource } from '../data/newsData';
import { NewsArticle } from '../types/news';

interface NewsCardProps {
  article: NewsArticle;
  isFeatured?: boolean;
  isBookmarked: boolean;
  isSpeaking: boolean;
  onOpen: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onSpeak: (article: NewsArticle) => void;
}

export function NewsCard({
  article,
  isFeatured = false,
  isBookmarked,
  isSpeaking,
  onOpen,
  onToggleBookmark,
  onSpeak,
}: NewsCardProps) {
  const source = getSource(article.sourceId);
  const fallbackSvg = buildCardFallbackSvg(article.category);
  const cleanImageUrl = article.imageUrl?.trim() || '';
  const [photoBroken, setPhotoBroken] = useState(false);

  useEffect(() => {
    setPhotoBroken(false);
  }, [article.id, cleanImageUrl]);

  const imgSrc = !photoBroken && cleanImageUrl ? cleanImageUrl : fallbackSvg;
  const showArticlePhoto = Boolean(article.hasArticleImage && cleanImageUrl && !photoBroken);

  const actionButtons = (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleBookmark(article.id);
        }}
        aria-label={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ الخبر'}
        title={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ الخبر'}
        className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
          isBookmarked
            ? 'bg-emerald-600 text-white'
            : 'bg-black/55 hover:bg-black/75 text-slate-100 backdrop-blur-xs'
        }`}
      >
        <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSpeak(article);
        }}
        aria-label={isSpeaking ? 'إيقاف القراءة الصوتية' : 'قراءة الخبر كاملاً بصوت نسائي'}
        title="قراءة الخبر كاملاً بصوت نسائي"
        className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
          isSpeaking
            ? 'bg-amber-400 text-slate-950 font-bold'
            : 'bg-black/55 hover:bg-amber-500 hover:text-slate-950 text-slate-100 backdrop-blur-xs'
        }`}
      >
        <Volume2 className="w-4 h-4" />
      </button>
    </div>
  );

  if (showArticlePhoto) {
    return (
      <article
        onClick={() => onOpen(article.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen(article.id);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`اقرأ خبر: ${article.title}`}
        className={`relative overflow-hidden cursor-pointer group rounded-2xl bg-slate-900 border transition-colors text-white flex flex-col justify-between ${
          isSpeaking
            ? 'border-amber-400 ring-2 ring-amber-400/50'
            : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/60'
        } ${isFeatured ? 'lg:col-span-2' : ''} focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}
      >
        {/* Real News Photo Header */}
        <div
          className={`relative w-full overflow-hidden bg-slate-950 ${
            isFeatured ? 'h-52 sm:h-64' : 'h-44 sm:h-48'
          }`}
        >
          <img
            src={imgSrc}
            alt={article.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setPhotoBroken(true)}
            className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
          />
          <div className="absolute top-2.5 left-2.5 z-10">{actionButtons}</div>
        </div>

        {/* Clean Editorial Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-200 min-w-0">
              <span className={`font-extrabold ${source.accentText}`}>
                {article.sourceName || source.name}
              </span>
              {article.governorate && (
                <>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="font-semibold text-emerald-300">{article.governorate}</span>
                </>
              )}
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="text-slate-300">{article.category}</span>
            </div>

            {isFeatured && (
              <p className="text-xs font-extrabold text-emerald-300">الخبر الأبرز الآن</p>
            )}

            <h3
              className={`font-display font-black leading-snug text-white group-hover:text-amber-200 transition-colors ${
                isFeatured ? 'text-lg sm:text-2xl' : 'text-base sm:text-lg'
              }`}
            >
              {article.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
              {article.summary}
            </p>
          </div>

          <div className="pt-2.5 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 tabular-nums">
              <span>{article.timeAgo}</span>
              <span aria-hidden="true">·</span>
              <span>{article.readTime}</span>
            </div>
            <span className="font-bold text-emerald-300">اقرأ التفاصيل ←</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => onOpen(article.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(article.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`اقرأ خبر: ${article.title}`}
      className={`relative overflow-hidden cursor-pointer group rounded-2xl bg-slate-900 border transition-colors text-white flex flex-col justify-between ${
        isSpeaking
          ? 'border-amber-400 ring-2 ring-amber-400/50'
          : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/60'
      } ${isFeatured ? 'p-5 sm:p-6 min-h-[280px] lg:col-span-2' : 'p-4 sm:p-5 min-h-[220px]'} focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}
    >
      {/* Background Fallback Editorial Image */}
      <img
        src={imgSrc}
        alt={article.title}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setPhotoBroken(true)}
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 pointer-events-none select-none"
      />

      {/* Measured Contrast Scrim */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(8,12,22,0.96) 0%, rgba(8,12,22,0.78) 55%, rgba(8,12,22,0.48) 100%)',
        }}
      />

      {/* Top Row: Clean Unboxed Metadata + 44px Touch Actions */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-200 min-w-0 pt-1">
          <span className={`font-extrabold ${source.accentText}`}>
            {article.sourceName || source.name}
          </span>
          {article.governorate && (
            <>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="font-semibold text-emerald-300">{article.governorate}</span>
            </>
          )}
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className="text-slate-300">{article.category}</span>
        </div>

        <div className="-mt-1 -ml-1">{actionButtons}</div>
      </div>

      {/* Main Editorial Content */}
      <div className="relative z-10 mt-6 space-y-2">
        {isFeatured && (
          <p className="text-xs font-extrabold text-emerald-300">الخبر الأبرز الآن</p>
        )}

        <h3
          className={`font-display font-black leading-snug text-white group-hover:text-amber-200 transition-colors ${
            isFeatured ? 'text-lg sm:text-2xl' : 'text-base sm:text-lg'
          }`}
        >
          {article.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed line-clamp-2">
          {article.summary}
        </p>

        <div className="pt-2.5 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 tabular-nums">
            <span>{article.timeAgo}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
          </div>
          <span className="font-bold text-emerald-300">اقرأ التفاصيل ←</span>
        </div>
      </div>
    </article>
  );
}

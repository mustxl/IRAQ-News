import { useEffect, useState } from 'react';
import { Bookmark, Share2, Volume2, X } from 'lucide-react';
import { buildCardFallbackSvg, getSource } from '../data/newsData';
import { NewsArticle } from '../types/news';

interface ArticleModalProps {
  article: NewsArticle | null;
  fontIdx: number;
  isBookmarked: boolean;
  isSpeaking: boolean;
  onClose: () => void;
  onFontChange: (delta: number) => void;
  onSpeak: (article: NewsArticle) => void;
  onToggleBookmark: (id: string) => void;
  onShare: (article: NewsArticle) => void;
}

export function ArticleModal({
  article,
  fontIdx,
  isBookmarked,
  isSpeaking,
  onClose,
  onFontChange,
  onSpeak,
  onToggleBookmark,
  onShare,
}: ArticleModalProps) {
  const [brokenArticleId, setBrokenArticleId] = useState<string | null>(null);

  useEffect(() => {
    if (!article) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [article, onClose]);

  if (!article) return null;

  const source = getSource(article.sourceId);
  const fallbackSvg = buildCardFallbackSvg(article.category);
  const rawImgUrl = article.imageUrl?.trim() || '';
  const isPhotoBroken = brokenArticleId === article.id;
  const fontSizeClasses = ['text-sm', 'text-base', 'text-lg'];
  const fontClass = fontSizeClasses[fontIdx] ?? 'text-base';
  const showFullPhoto = Boolean(article.hasArticleImage && rawImgUrl && !isPhotoBroken);
  const displaySrc = !isPhotoBroken && rawImgUrl ? rawImgUrl : fallbackSvg;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Drag Handle (Mobile) */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs min-w-0">
            <span className={`font-extrabold truncate ${source.accentText}`}>
              {article.sourceName || source.name}
            </span>
            {article.governorate && (
              <>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  {article.governorate}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onSpeak(article)}
              className={`h-10 px-3 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'إيقاف القراءة' : 'استمع للخبر كاملاً'}</span>
            </button>

            <button
              type="button"
              onClick={() => onFontChange(-1)}
              disabled={fontIdx <= 0}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black disabled:opacity-40 cursor-pointer"
              title="تصغير الخط"
              aria-label="تصغير الخط"
            >
              أ-
            </button>

            <button
              type="button"
              onClick={() => onFontChange(1)}
              disabled={fontIdx >= 2}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black disabled:opacity-40 cursor-pointer"
              title="تكبير الخط"
              aria-label="تكبير الخط"
            >
              أ+
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {showFullPhoto ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl bg-slate-950 border border-slate-200 dark:border-slate-800">
                <img
                  src={displaySrc}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (!isPhotoBroken) setBrokenArticleId(article.id);
                  }}
                  className="w-full max-h-80 object-cover"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {article.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{article.timeAgo}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTime}</span>
                </div>
                <h2
                  id="article-modal-title"
                  className="font-display font-black text-lg sm:text-2xl leading-snug text-slate-900 dark:text-white"
                >
                  {article.title}
                </h2>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl p-5 bg-slate-900 text-white min-h-[210px] flex flex-col justify-end">
              <img
                src={displaySrc}
                alt={article.title}
                referrerPolicy="no-referrer"
                onError={() => {
                  if (!isPhotoBroken) setBrokenArticleId(article.id);
                }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-slate-900/25" />

              <div className="relative z-10 space-y-2">
                <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-200 tabular-nums">
                  <span>{article.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.timeAgo}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTime}</span>
                </div>
                <h2
                  id="article-modal-title"
                  className="font-display font-black text-lg sm:text-2xl leading-snug text-white"
                >
                  {article.title}
                </h2>
              </div>
            </div>
          )}

          {/* Highlights Box */}
          <div className="bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 space-y-2">
            <h3 className="font-display font-extrabold text-xs text-amber-800 dark:text-amber-300">
              أبرز ما في الخبر
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc pr-4">
              {article.highlights.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Full Paragraphs */}
          <div className={`space-y-4 text-slate-800 dark:text-slate-200 leading-relaxed ${fontClass}`}>
            {article.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {article.externalUrl && (
            <div className="pt-2">
              <a
                href={article.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>قراءة الخبر من المصدر الأصلي</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onToggleBookmark(article.id)}
            className={`flex-1 h-11 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              isBookmarked
                ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            <span>{isBookmarked ? 'محفوظ في القائمة' : 'حفظ في المحفوظات'}</span>
          </button>

          <button
            type="button"
            onClick={() => onShare(article)}
            className="flex-1 h-11 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة / نسخ</span>
          </button>
        </div>
      </div>
    </div>
  );
}

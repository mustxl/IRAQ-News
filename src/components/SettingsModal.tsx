import { useEffect } from 'react';
import { Moon, RotateCcw, Sun, Volume2, X } from 'lucide-react';
import { SOURCES } from '../data/newsData';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  isDark: boolean;
  fontIdx: number;
  voiceLabel: string;
  isTestingAudio: boolean;
  enabledSources: string[];
  archiveCount: number;
  onClose: () => void;
  onToggleTheme: () => void;
  onFontChange: (delta: number) => void;
  onTestAudio: () => void;
  onToggleSource: (sourceId: string) => void;
  onSelectAllSources: () => void;
  onSelectIraqOnlySources: () => void;
  onResetArchive: () => void;
}

export function SettingsModal({
  isOpen,
  isDark,
  fontIdx,
  voiceLabel,
  isTestingAudio,
  enabledSources,
  archiveCount,
  onClose,
  onToggleTheme,
  onFontChange,
  onTestAudio,
  onToggleSource,
  onSelectAllSources,
  onSelectIraqOnlySources,
  onResetArchive,
}: SettingsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fontNames = ['صغير', 'متوسط', 'كبير'];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h2
            id="settings-modal-title"
            className="font-display font-black text-base text-slate-900 dark:text-white"
          >
            الإعدادات وضبط المصادر
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* تثبيت تطبيق الأندرويد */}
          <PWAInstallButton variant="settings" />

          {/* المظهر وحجم الخط */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  المظهر (الوضع الليلي / النهاري)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isDark ? 'الوضع الليلي مفعّل' : 'الوضع النهاري مفعّل'}
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className="h-10 px-4 rounded-xl bg-slate-900 dark:bg-amber-400 text-white dark:text-slate-950 text-xs font-extrabold flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{isDark ? 'التبديل للنهاري' : 'التبديل لليلي'}</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  حجم خط القراءة الافتراضي
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{fontNames[fontIdx] ?? 'متوسط'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onFontChange(-1)}
                  disabled={fontIdx <= 0}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-black disabled:opacity-40 cursor-pointer"
                >
                  أ-
                </button>
                <button
                  type="button"
                  onClick={() => onFontChange(1)}
                  disabled={fontIdx >= 2}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-black disabled:opacity-40 cursor-pointer"
                >
                  أ+
                </button>
              </div>
            </div>
          </div>

          {/* اختبار القارئ الصوتي */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                قارئ الأخبار الصوتي النسائي
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold truncate">
                {voiceLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onTestAudio}
              className={`h-10 px-3.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                isTestingAudio
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isTestingAudio ? 'إيقاف التجربة' : 'تجربة القارئ'}</span>
            </button>
          </div>

          {/* إدارة المصادر */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  إدارة المصادر الإخبارية
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تفعيل أو إخفاء أي قناة أو وكالة أو جريدة
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSelectAllSources}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  تحديد الكل
                </button>
                <button
                  type="button"
                  onClick={onSelectIraqOnlySources}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                >
                  المصادر العراقية فقط
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOURCES.map((src) => {
                const checked = enabledSources.includes(src.id);
                return (
                  <label
                    key={src.id}
                    className="flex items-center justify-between min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {src.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSource(src.id)}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* أرشيف الأخبار */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                أرشيف الأخبار المحفوظ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                عدد الأخبار المخزنة: {archiveCount} خبر
              </p>
            </div>
            <button
              type="button"
              onClick={onResetArchive}
              className="h-10 px-3.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/70 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الأرشيف</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

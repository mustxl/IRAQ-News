import { useState } from 'react';
import { CheckCircle2, Download, Share2, Smartphone, Tablet, X } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'settings';
}

export function PWAInstallButton({ variant = 'header' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, isEmbedded, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (variant === 'header' && isInstalled) {
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowGuide(true);
  };

  const guideModal = showGuide ? (
    <div
      className="fixed inset-0 z-[70] flex flex-col justify-end md:items-center md:justify-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-guide-title"
    >
      <div
        onClick={() => setShowGuide(false)}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </span>
            <h3
              id="pwa-install-guide-title"
              className="font-display font-black text-base text-slate-900 dark:text-white"
            >
              تثبيت التطبيق على الهاتف والتابلت
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(false)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-sky-500" />
              <span>التثبيت على iPhone و iPad:</span>
            </p>
            <ol className="list-decimal pr-5 space-y-1">
              <li>اضغط على زر المشاركة (Share) في شريط متصفح Safari.</li>
              <li>اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).</li>
              <li>اضغط «إضافة» ليعمل كتطبيق مستقل بملء الشاشة.</li>
            </ol>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4 space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Tablet className="w-4 h-4 text-emerald-500" />
              <span>خطوات التثبيت على أندرويد (موبايل وتابلت):</span>
            </p>
            {isEmbedded && (
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                ملاحظة: أنت تتصفح من داخل نافذة المعاينة؛ افتح رابط التطبيق في متصفح Chrome على جهازك الأندرويد ليظهر زر التثبيت المباشر.
              </p>
            )}
            <ol className="list-decimal pr-5 space-y-1.5">
              <li>افتح رابط التطبيق في متصفح Google Chrome على الهاتف أو التابلت.</li>
              <li>اضغط على قائمة النقاط الثلاث (⋮) أعلى المتصفح.</li>
              <li>اختر «تثبيت التطبيق» (Install app) أو «الإضافة إلى الشاشة الرئيسية».</li>
              <li>سيُثبّت التطبيق بأيقونته الخاصة في قائمة تطبيقات الأندرويد ويعمل دون شريط متصفح وحتى عند انقطاع الشبكة.</li>
            </ol>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowGuide(false)}
          className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold cursor-pointer transition-colors"
        >
          حسناً
        </button>
      </div>
    </div>
  ) : null;

  if (variant === 'settings') {
    if (isInstalled) {
      return (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              التطبيق مثبت ويعمل بوضع التطبيق المستقل
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              مُهيّأ لهواتف الأندرويد والتابلت مع دعم العمل دون إنترنت.
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
              تثبيت كتطبيق أندرويد (موبايل وتابلت)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isInstallable
                ? 'جاهز للتثبيت المباشر على الشاشة الرئيسية بملء الشاشة'
                : 'تثبيت سريع عبر Chrome بدون شريط متصفح مع حفظ الأخبار'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleTrigger()}
            className="h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{isInstallable ? 'تثبيت الآن' : 'طريقة التثبيت'}</span>
          </button>
        </div>
        {guideModal}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleTrigger()}
        title="تثبيت كتطبيق أندرويد على الهاتف والتابلت"
        aria-label="تثبيت التطبيق"
        className="h-10 px-2.5 sm:px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 transition-all cursor-pointer"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">تثبيت التطبيق</span>
        <span className="sm:hidden">تثبيت</span>
      </button>
      {guideModal}
    </>
  );
}

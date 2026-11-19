import { Loader2, Pause, Play, SkipForward, Volume2, X } from 'lucide-react';
import { AudioReaderState } from '../utils/useFemaleReader';

interface AudioPlayerBarProps {
  audioState: AudioReaderState;
  onTogglePause: () => void;
  onNextChunk: () => void;
  onStop: () => void;
}

export function AudioPlayerBar({
  audioState,
  onTogglePause,
  onNextChunk,
  onStop,
}: AudioPlayerBarProps) {
  if (!audioState.activeId) return null;

  const total = Math.max(1, audioState.totalChunks);
  const current = Math.min(total, audioState.currentChunkIndex + 1);
  const pct = Math.round((current / total) * 100);

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-3 right-3 max-w-2xl mx-auto z-[60] bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 border border-amber-400/50 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
            {audioState.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] tabular-nums">
              <span className="text-emerald-300 font-bold">
                {audioState.isLoading
                  ? 'جاري تحضير الصوت...'
                  : audioState.mode === 'cloud'
                  ? 'القارئ الإخباري السحابي'
                  : 'صوت النظام'}
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="font-bold text-amber-300">
                {current}/{total}
              </span>
            </div>
            <p className="text-xs font-extrabold text-white truncate">{audioState.activeTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onTogglePause}
            className="h-9 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            {audioState.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{audioState.isPaused ? 'استئناف' : 'إيقاف مؤقت'}</span>
          </button>

          <button
            type="button"
            onClick={onNextChunk}
            className="h-9 px-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="الجملة التالية"
          >
            <span>التالي</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onStop}
            className="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer"
            aria-label="إيقاف القراءة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-amber-200/95 truncate">{audioState.currentSubtitle}</p>
      </div>
    </div>
  );
}

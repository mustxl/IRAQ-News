import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../utils/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 lg:bottom-5 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-3.5 py-2 text-xs font-extrabold shadow-lg border border-amber-300"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>وضع عدم الاتصال · يتم عرض الأخبار المحفوظة</span>
    </div>
  );
}

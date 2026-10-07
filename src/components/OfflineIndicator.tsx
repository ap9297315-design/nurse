import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      id="offline-status-pill"
      aria-label="Offline status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xl border border-amber-400/50 backdrop-blur-md animate-fade-in"
    >
      <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
      <span>Offline Mode — Cached INC Nursing Study Data Active</span>
    </aside>
  );
};

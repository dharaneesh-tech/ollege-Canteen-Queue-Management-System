import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, X, Volume2 } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

export const NotificationBanner: React.FC = () => {
  const { activeNotification, dismissNotification, soundEnabled } = useQueue();

  if (!activeNotification) return null;

  const isReady = activeNotification.type === 'ready';

  return (
    <div
      id="canteen-active-notification-banner"
      className={`relative z-50 w-full px-4 py-3.5 transition-all shadow-md ${
        isReady
          ? 'bg-emerald-600 text-white'
          : 'bg-amber-500 text-slate-900'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              isReady ? 'bg-emerald-700/80 text-white' : 'bg-amber-600/60 text-slate-950'
            }`}
          >
            {isReady ? <CheckCircle2 className="w-5 h-5 animate-bounce" /> : <AlertTriangle className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">{activeNotification.title}</span>
              {soundEnabled && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-black/15 font-medium">
                  <Volume2 className="w-3 h-3" /> Chime Played
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isReady ? 'text-emerald-100' : 'text-slate-900/90'}`}>
              {activeNotification.message}
            </p>
          </div>
        </div>

        <button
          id="btn-dismiss-notification"
          onClick={dismissNotification}
          className={`p-1.5 rounded-lg transition-colors ${
            isReady
              ? 'hover:bg-emerald-700 text-white/90'
              : 'hover:bg-amber-600/70 text-slate-900'
          }`}
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

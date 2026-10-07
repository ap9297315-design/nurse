import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  ExternalLink,
  X,
  ShieldCheck,
  Globe,
  Monitor,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'modal';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed, show subtle installed badge or hide
  if (isInstalled && variant === 'banner') {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
        return;
      }
    }
    setShowModal(true);
  };

  const handleOpenStandaloneTab = () => {
    const appUrl = window.location.href;
    window.open(appUrl, '_blank');
  };

  return (
    <>
      {/* Header Pill Button */}
      {variant === 'header' && (
        <button
          id="btn-pwa-install-header"
          onClick={handleInstallClick}
          className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isInstalled
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
              : 'bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white hover:brightness-110 active:scale-95 shadow-teal-500/20'
          } ${className}`}
          title={isInstalled ? 'NurseSphere App Installed' : 'Install NurseSphere on your phone or PC'}
        >
          {isInstalled ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Installed</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span>Install App</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
            </>
          )}
        </button>
      )}

      {/* Floating Bottom Quick Install Banner */}
      {variant === 'banner' && !isInstalled && (
        <aside
          id="pwa-install-sticky-banner"
          aria-label="App installation prompt"
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-teal-500/40 backdrop-blur-md animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-md">
              <img
                src="/icon.svg"
                alt="NurseSphere App Logo"
                className="w-7 h-7"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-teal-300 truncate">Install NurseSphere App</p>
                <span className="text-[10px] px-1.5 py-0.2 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded font-semibold">
                  Free PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                Install on Android, iOS or PC for fast offline nursing study
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                id="btn-banner-install-now"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Comprehensive Installation Modal Guide */}
      {showModal && (
        <div
          id="modal-pwa-install"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              id="btn-close-pwa-modal"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-lg p-2 flex-shrink-0">
                <img src="/icon.svg" alt="NurseSphere App" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    NurseSphere PWA Install
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Indian Nursing Council (INC) B.Sc Curriculum &amp; Virtual OT Suite
                </p>
              </div>
            </div>

            {/* Direct One-Click Install if available */}
            {isInstallable && (
              <div className="mb-5 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Direct Browser Install Available!
                  </p>
                  <p className="text-xs text-teal-700 dark:text-teal-400">
                    Click the button below to add NurseSphere directly to your device home screen.
                  </p>
                </div>
                <button
                  id="btn-modal-direct-install"
                  onClick={async () => {
                    const res = await install();
                    if (res) {
                      setShowModal(false);
                      setInstallSuccess(true);
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 whitespace-nowrap transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Install to Device</span>
                </button>
              </div>
            )}

            {/* If in Iframe Notice */}
            {isInIframe && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <div className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold">Preview Note: </span>
                    Browsers restrict direct home screen installation inside preview frames. Open in a new tab for instant 1-tap installation:
                  </div>
                </div>
                <button
                  id="btn-open-tab-for-pwa"
                  onClick={handleOpenStandaloneTab}
                  className="mt-2.5 w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Screen in New Tab</span>
                </button>
              </div>
            )}

            {/* Instructions By Platform */}
            <div className="space-y-3 mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Choose Your Device Guide
              </h4>

              {/* Android & Google Chrome */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Android (Chrome / Samsung Internet)
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                    <li>Open this page in Google Chrome on your phone.</li>
                    <li>
                      Tap the <strong>3 vertical dots</strong> (Menu) in top-right.
                    </li>
                    <li>
                      Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                    </li>
                    <li>The NurseSphere icon will appear on your phone like a native app!</li>
                  </ol>
                </div>
              </div>

              {/* iPhone / iPad (iOS Safari) */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-3">
                <Share className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    iPhone / iPad (Apple Safari)
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                    <li>Open this website in <strong>Safari</strong> on iOS.</li>
                    <li>
                      Tap the <strong>Share</strong> button <span className="inline-block px-1 py-0.2 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">⎋</span> at the bottom of the screen.
                    </li>
                    <li>
                      Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> <PlusSquare className="inline w-3 h-3 text-blue-500" />.
                    </li>
                    <li>Tap <strong>Add</strong> in the top-right corner. Done!</li>
                  </ol>
                </div>
              </div>

              {/* PC / Laptop (Chrome / Edge) */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-3">
                <Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Desktop PC / Laptop (Chrome, Edge, Brave)
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    Look at the right side of the browser address bar (URL bar). Click the <strong>Install</strong> icon 
                    (a monitor with a down arrow or &quot;Install NurseSphere&quot;), then confirm.
                  </p>
                </div>
              </div>
            </div>

            {/* Key PWA Features */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fast Offline Access
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero PlayStore Download Needed
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fullscreen Mode
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                id="btn-pwa-modal-close"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                id="btn-pwa-modal-open-tab"
                onClick={handleOpenStandaloneTab}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {installSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>NurseSphere installed successfully! You can now launch it from your home screen.</span>
        </div>
      )}
    </>
  );
};

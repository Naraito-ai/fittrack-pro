import { useState } from 'react';
import usePWA from '../../hooks/usePWA';

// ── Offline Banner ────────────────────────────────────────────────────────────
export const OfflineBanner = () => {
  const { isOnline } = usePWA();
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-amber-500/95 backdrop-blur-sm py-2 px-4 animate-slide-down">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-forge-950 flex-shrink-0">
        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="font-display font-700 text-forge-950 text-sm tracking-wide">
        You're offline — cached data is available
      </span>
    </div>
  );
};

// ── Update Available Banner ───────────────────────────────────────────────────
export const UpdateBanner = () => {
  const { updateReady, applyUpdate } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!updateReady || dismissed) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:max-w-sm z-[90] animate-slide-up">
      <div className="card border-lime-500/30 bg-forge-850 shadow-forge-lg p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-lime-500/15 border border-lime-500/25 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-lime-400">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-700 text-white text-sm">Update Available</p>
          <p className="font-mono text-xs text-forge-500 mt-0.5">A new version is ready to install</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 flex items-center justify-center text-forge-500 hover:text-forge-300 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
          <button onClick={applyUpdate} className="btn-primary py-1.5 px-3 text-xs">
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Install Prompt (Android/Desktop) ─────────────────────────────────────────
export const InstallPrompt = () => {
  const { canInstall, triggerInstall, isIOS, isInstalled } = usePWA();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-install-dismissed') === 'true'
  );
  const [installing, setInstalling] = useState(false);

  if (isInstalled || dismissed) return null;
  // Show iOS instructions or native prompt
  if (!canInstall && !isIOS) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await triggerInstall();
    setInstalling(false);
    if (!accepted) setDismissed(true);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:max-w-sm z-[90] animate-slide-up">
      <div className="card border-amber-500/25 bg-forge-850 shadow-forge-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-amber-glow flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5 text-forge-950">
              <path d="M6 4v6m0 4v6M18 4v6m0 4v6M2 9h4m12 0h4M2 15h4m12 0h4"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-700 text-white text-sm">Install FitTrack Pro</p>
            <p className="font-mono text-xs text-forge-500 mt-0.5 leading-relaxed">
              {isIOS
                ? 'Tap Share → "Add to Home Screen" for the best experience'
                : 'Install for faster access, offline support & home screen shortcut'}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center text-forge-500 hover:text-forge-300 transition-colors flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {isIOS ? (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-forge-800 rounded-lg border border-forge-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-azure-400 flex-shrink-0">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round"/>
              <polyline points="16 6 12 2 8 6" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round"/>
            </svg>
            <span className="font-mono text-xs text-forge-400">
              Tap <span className="text-azure-400">Share</span> then{' '}
              <span className="text-azure-400">Add to Home Screen</span>
            </span>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <button onClick={handleDismiss} className="btn-secondary flex-1 py-1.5 text-xs">
              Not now
            </button>
            <button onClick={handleInstall} disabled={installing} className="btn-primary flex-1 py-1.5 text-xs">
              {installing ? 'Installing...' : '📲 Install App'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Network Status Indicator (subtle dot in Navbar) ──────────────────────────
export const NetworkIndicator = () => {
  const { isOnline } = usePWA();
  return (
    <div
      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
        isOnline ? 'bg-lime-400' : 'bg-amber-400 animate-pulse'
      }`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

export default InstallPrompt;

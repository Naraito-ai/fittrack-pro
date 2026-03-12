import { useState, useEffect, useCallback } from 'react';

const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled,   setIsInstalled]   = useState(false);
  const [isOnline,      setIsOnline]      = useState(navigator.onLine);
  const [updateReady,   setUpdateReady]   = useState(false);
  const [swReg,         setSwReg]         = useState(null);

  const isIOS        = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    const onBefore   = (e) => { e.preventDefault(); setInstallPrompt(e); };
    const onInstalled = ()  => { setInstallPrompt(null); setIsInstalled(true); };
    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled',        onInstalled);
    if (isStandalone) setIsInstalled(true);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled',        onInstalled);
    };
  }, []);

  useEffect(() => {
    const up   = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online',  up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then((reg) => {
      setSwReg(reg);
      if (reg.waiting) setUpdateReady(true);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', function() {
          if (this.state === 'installed' && navigator.serviceWorker.controller) setUpdateReady(true);
        });
      });
      const t = setInterval(() => { if (!document.hidden) reg.update().catch(() => {}); }, 60_000);
      return () => clearInterval(t);
    }).catch(() => {});
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstallPrompt(null);
    return outcome === 'accepted';
  }, [installPrompt]);

  const applyUpdate = useCallback(() => {
    if (!swReg?.waiting) return;
    swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
    swReg.waiting.addEventListener('statechange', function() {
      if (this.state === 'activated') window.location.reload();
    });
  }, [swReg]);

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled: isInstalled || (isIOS && isStandalone),
    isIOS, isOnline, updateReady, triggerInstall, applyUpdate,
  };
};

export default usePWA;

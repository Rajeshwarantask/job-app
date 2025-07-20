import { useState, useEffect } from 'react';

interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: any;
}

export const usePWA = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isInstallable: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null
  });

  useEffect(() => {
    // Check if app is installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isInWebAppiOS;
      
      setStatus(prev => ({ ...prev, isInstalled }));
    };

    // Check for installability
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setStatus(prev => ({ ...prev, isInstallable: true, installPrompt: e }));
    };

    // Handle online/offline status
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    // Handle app installation
    const handleAppInstalled = () => {
      setStatus(prev => ({ ...prev, isInstalled: true, isInstallable: false, installPrompt: null }));
    };

    // Check for service worker updates
    const checkForUpdates = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setStatus(prev => ({ ...prev, isUpdateAvailable: true }));
        });
      }
    };

    checkInstallStatus();
    checkForUpdates();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (status.installPrompt) {
      try {
        await status.installPrompt.prompt();
        const { outcome } = await status.installPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setStatus(prev => ({ ...prev, installPrompt: null, isInstallable: false }));
        }
      } catch (error) {
        console.error('Installation failed:', error);
      }
    }
  };

  const reloadApp = () => {
    window.location.reload();
  };

  return {
    ...status,
    reloadApp,
    installApp
  };
};
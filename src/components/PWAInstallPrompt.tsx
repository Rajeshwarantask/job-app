import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showFeatures, setShowFeatures] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after user interaction to not be intrusive
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
        const dismissCount = parseInt(localStorage.getItem('pwa-install-dismiss-count') || '0');
        if (!hasSeenPrompt && dismissCount < 3) {
          setShowPrompt(true);
        }
      }, 15000); // Show after 15 seconds
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      
      toast({
        title: "App Installed!",
        description: "JobTrail has been installed successfully. You can now access it from your home screen.",
      });
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

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
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "Installing...",
          description: "JobTrail is being installed on your device.",
        });
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwa-install-prompt-seen', 'true');
    } catch (error) {
      console.error('Error during installation:', error);
      toast({
        title: "Installation Error",
        description: "There was an issue installing the app. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-seen', 'true');
    
    const dismissCount = parseInt(localStorage.getItem('pwa-install-dismiss-count') || '0');
    localStorage.setItem('pwa-install-dismiss-count', (dismissCount + 1).toString());
    
    // Show again after increasing intervals
    const delay = Math.min(7 * (dismissCount + 1), 30); // Max 30 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-prompt-seen');
    }, delay * 24 * 60 * 60 * 1000);
  };

  const getDeviceIcon = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const features = [
    { icon: Zap, text: 'Lightning fast loading' },
    { icon: isOnline ? Wifi : WifiOff, text: 'Works offline' },
    { icon: Smartphone, text: 'Native app experience' },
  ];

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getDeviceIcon()}
              <div>
                <h3 className="text-white font-semibold text-sm">Install JobTrail</h3>
                <Badge className="bg-blue-500/20 text-blue-300 text-xs mt-1">
                  PWA Ready
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            Get the full native app experience with offline support and faster performance.
          </p>
          
          <div className="space-y-2 mb-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
                <feature.icon className="h-3 w-3 text-blue-400" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
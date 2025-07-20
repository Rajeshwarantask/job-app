import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const PWAStatus = () => {
  const { isInstalled, isInstallable, isOnline, isUpdateAvailable, installApp, reloadApp } = usePWA();

  const getInstallationStatus = () => {
    if (isInstalled) {
      return {
        icon: CheckCircle,
        text: 'App Installed',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30'
      };
    }
    if (isInstallable) {
      return {
        icon: Download,
        text: 'Ready to Install',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/30'
      };
    }
    return {
      icon: AlertCircle,
      text: 'Web Version',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30'
    };
  };

  const getDeviceIcon = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const status = getInstallationStatus();
  const DeviceIcon = getDeviceIcon();
  const StatusIcon = status.icon;

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Smartphone className="h-5 w-5 mr-2" />
          App Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Installation Status */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${status.bgColor} border ${status.borderColor}`}>
              <StatusIcon className={`h-4 w-4 ${status.color}`} />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{status.text}</p>
              <p className="text-gray-400 text-xs">
                {isInstalled ? 'Running as installed app' : 
                 isInstallable ? 'Can be installed locally' : 
                 'Browser version only'}
              </p>
            </div>
          </div>
          <DeviceIcon className="h-5 w-5 text-gray-400" />
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isOnline ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'} border`}>
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-gray-400 text-xs">
                {isOnline ? 'All features available' : 'Limited functionality'}
              </p>
            </div>
          </div>
          <Badge className={isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
            {isOnline ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {isInstallable && !isInstalled && (
            <Button
              onClick={installApp}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Install JobTrail App
            </Button>
          )}

          {isUpdateAvailable && (
            <Button
              onClick={reloadApp}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Available - Install Now
            </Button>
          )}

          {isInstalled && (
            <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 text-sm font-medium">App Successfully Installed</p>
              <p className="text-green-400 text-xs">Enjoy the native app experience!</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm">PWA Features</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2 text-gray-300">
              <div className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span>Offline Support</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span>Fast Loading</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span>Home Screen</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span>Push Notifications</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { RefreshCw, Download } from 'lucide-react';

export const PWAUpdateNotification = () => {
  const { isUpdateAvailable, reloadApp } = usePWA();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Download className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-semibold text-sm">Update Available</h3>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            A new version of JobTrail is available with improvements and bug fixes.
          </p>
          
          <Button
            onClick={reloadApp}
            size="sm"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
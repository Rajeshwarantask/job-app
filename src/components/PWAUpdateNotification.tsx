import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { RefreshCw, Download, X } from 'lucide-react';

export const PWAUpdateNotification = () => {
  const { isUpdateAvailable, reloadApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isUpdateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-top-4 duration-500">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-green-400" />
              <div>
                <h3 className="text-white font-semibold text-sm">Update Available</h3>
                <Badge className="bg-green-500/20 text-green-300 text-xs mt-1">
                  New Version
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            A new version with improvements and bug fixes is ready to install.
          </p>
          
          <div className="flex space-x-2">
            <Button
              onClick={reloadApp}
              size="sm"
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Now
            </Button>
            <Button
              onClick={() => setDismissed(true)}
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
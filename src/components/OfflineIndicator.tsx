import React from 'react';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  return (
    <div className="fixed top-4 left-4 z-50">
      <Badge 
        className={`
          ${isOnline 
            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border-red-500/30'
          } 
          backdrop-blur-sm
        `}
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3 mr-1" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </>
        )}
      </Badge>
    </div>
  );
};
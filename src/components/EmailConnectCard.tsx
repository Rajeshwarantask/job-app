import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Lock
} from 'lucide-react';

interface EmailConnectCardProps {
  hasCredentials: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  userEmail?: string;
}

export const EmailConnectCard = ({ 
  hasCredentials, 
  isConnected, 
  isConnecting, 
  onConnect, 
  onDisconnect,
  userEmail 
}: EmailConnectCardProps) => {
  
  if (!hasCredentials) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">OAuth Setup Required</h3>
            <p className="text-gray-300">
              Please configure your Google OAuth credentials first to enable Gmail integration.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            🔒 Connect Your Email
          </span>
          {isConnected && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-400" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Connect Your Gmail</h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  To display your inbox and provide real-time updates, please securely connect your Gmail account.
                </p>
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/20 text-left">
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-blue-300">
                  We only request read-only access to your inbox. Your data is not stored or shared.
                </AlertDescription>
              </Alert>

              <Button
                onClick={onConnect}
                disabled={isConnecting}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-6 rounded-lg flex items-center justify-center space-x-3 transition-all duration-200"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-400 space-y-1">
                <p>By connecting, you agree to our privacy policy</p>
                <p>You can disconnect at any time</p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-green-300 font-medium">Gmail Connected Successfully</p>
                  {userEmail && (
                    <p className="text-green-400 text-sm">{userEmail}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Shield className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Secure Access</p>
                <p className="text-gray-400 text-xs">Read-only permissions</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <RefreshCw className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Auto Sync</p>
                <p className="text-gray-400 text-xs">Real-time updates</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Mail className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Smart Detection</p>
                <p className="text-gray-400 text-xs">Job email parsing</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onDisconnect}
                className="flex-1 border-red-500/30 text-red-300 hover:bg-red-500/20"
              >
                Disconnect Gmail
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Permissions
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
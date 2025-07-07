import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGmail } from '@/context/GmailContext';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Unlink,
  Clock,
  Shield,
  Zap,
  Eye,
  Settings
} from 'lucide-react';

export const GmailIntegration = () => {
  const { 
    isConnected, 
    isConnecting, 
    lastSync, 
    processedEmails, 
    connectGmail, 
    disconnectGmail, 
    syncEmails 
  } = useGmail();
  
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncEmails();
    setIsSyncing(false);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'interview': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'test': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'offer': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Gmail Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isConnected ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">
                  {isConnected ? 'Connected' : 'Not Connected'}
                </p>
                <p className="text-gray-400 text-sm">
                  {isConnected 
                    ? 'Automatically monitoring job-related emails'
                    : 'Connect Gmail to enable automatic job tracking'
                  }
                </p>
              </div>
            </div>
            
            {isConnected ? (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  size="sm"
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
                <Button
                  onClick={disconnectGmail}
                  size="sm"
                  variant="outline"
                  className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectGmail}
                disabled={isConnecting}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Connect Gmail
                  </>
                )}
              </Button>
            )}
          </div>

          {isConnected && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-300">
                  <Clock className="h-4 w-4 mr-2" />
                  Last sync: {formatLastSync(lastSync)}
                </div>
                <div className="text-gray-300">
                  {processedEmails.length} emails processed
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Smart Email Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-medium mb-1">Secure & Private</h3>
              <p className="text-gray-400 text-sm">Read-only access with encrypted token storage</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <Eye className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-medium mb-1">Smart Detection</h3>
              <p className="text-gray-400 text-sm">AI-powered status detection from email content</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <RefreshCw className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-medium mb-1">Auto Sync</h3>
              <p className="text-gray-400 text-sm">Automatic background synchronization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Email Activity */}
      {isConnected && processedEmails.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Recent Email Activity
              </span>
              <Badge className="bg-blue-500/20 text-blue-300">
                {processedEmails.length} emails
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedEmails.slice(0, 5).map((email, index) => (
                <div key={email.messageId} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{email.subject}</h4>
                      <p className="text-gray-400 text-sm">{email.company}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {email.detectedStatus && (
                        <Badge className={`text-xs ${getStatusColor(email.detectedStatus)}`}>
                          {email.detectedStatus}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {Math.round(email.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{email.sender}</span>
                    <span>{email.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {processedEmails.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  View All Emails
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Privacy & Security Info */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium">Read-Only Access</p>
              <p className="text-gray-400 text-xs">We only read your emails, never send or modify them</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium">Encrypted Storage</p>
              <p className="text-gray-400 text-xs">All tokens and data are encrypted and stored securely</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium">No Email Storage</p>
              <p className="text-gray-400 text-xs">We only extract job status, not full email content</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium">Revoke Anytime</p>
              <p className="text-gray-400 text-xs">Disconnect and revoke access at any time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useGmailApi, ParsedMessage } from '@/hooks/useGmailApi';
import { useGmail } from '@/context/GmailContext';
import { EmailTable } from './EmailTable';
import { LogoutButton } from './LogoutButton';
import { 
  Mail, 
  RefreshCw, 
  User,
  Inbox,
  Settings
} from 'lucide-react';

export const InboxViewer = () => {
  const [maxResults, setMaxResults] = useState([10]);
  const { messages, isLoading, fetchMessages, isAuthenticated } = useGmailApi();
  const { userEmail, connectGmail, isConnecting } = useGmail();

  useEffect(() => {
    if (isAuthenticated()) {
      fetchMessages(maxResults[0]);
    }
  }, []);

  const handleSliderChange = async (value: number[]) => {
    setMaxResults(value);
    if (isAuthenticated()) {
      try {
        await fetchMessages(value[0]);
      } catch (error) {
        console.error('Error fetching messages with new count:', error);
      }
    }
  };

  const handleRefresh = async () => {
    if (isAuthenticated()) {
      try {
        await fetchMessages(maxResults[0]);
      } catch (error) {
        console.error('Error refreshing messages:', error);
      }
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Gmail Inbox Viewer</h1>
              <p className="text-gray-300">
                Sign in with your Google account to view your inbox messages
              </p>
            </div>

            <Button
              onClick={connectGmail}
              disabled={isConnecting}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-6 rounded-lg flex items-center justify-center space-x-3"
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
                  <span>Sign in with Google</span>
                </>
              )}
            </Button>

            <p className="text-xs text-gray-400">
              We'll only access your Gmail with read-only permissions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        {/* Header */}
        <div className="border-b border-white/20 bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Inbox className="h-8 w-8 text-blue-400" />
                  <h1 className="text-2xl font-bold text-white">Gmail Inbox Viewer</h1>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Connected
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{userEmail}</span>
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Controls */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Message Controls
                  </span>
                  <Button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    size="sm"
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of messages to display: {maxResults[0]}
                    </label>
                    <Slider
                      value={maxResults}
                      onValueChange={handleSliderChange}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1</span>
                      <span>50</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-300">
                      Showing <span className="font-semibold text-white">{messages.length}</span> messages
                    </p>
                    {isLoading && (
                      <p className="text-xs text-blue-400">Loading...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Table */}
            <EmailTable messages={messages} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};
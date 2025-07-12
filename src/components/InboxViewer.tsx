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
  const navigate = useNavigate();
  const [maxResults, setMaxResults] = useState([10]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<Date | null>(null);

  const { isAuthenticated, messages, fetchMessages, isLoading } = useGmailApi();
  const { connectGmail, isConnecting, userEmail } = useGmail();

  useEffect(() => {
    if (isAuthenticated()) fetchMessages(maxResults[0]);
  }, []);

  const handleSliderChange = async (value: number[]) => {
    setMaxResults(value);
    if (isAuthenticated()) await fetchMessages(value[0]);
  };

  const handleRefresh = async () => {
    if (isAuthenticated()) await fetchMessages(maxResults[0]);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterDate(null);
  };

  const filteredMessages: ParsedMessage[] = messages.filter(msg => {
    const matchesSearch =
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? new Date(msg.date).toDateString() === filterDate.toDateString() : true;
    return matchesSearch && matchesDate;
  });

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Gmail Inbox Viewer</h1>
            <p className="text-gray-300">Sign in to view your job-related Gmail messages.</p>
            <Button
              onClick={connectGmail}
              disabled={isConnecting}
              className="w-full bg-white text-gray-900 hover:bg-gray-100"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    {/* Google icon paths */}
                    <path d="..." />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
            <p className="text-xs text-gray-400">We'll only access Gmail in read-only mode.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="border-b border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex space-x-3 items-center">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Inbox className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Inbox Viewer</h2>
            <Badge className="bg-green-600/30 text-green-300">Connected</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-300 flex items-center">
              <User className="h-4 w-4 mr-1" /> {userEmail}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5" />
                <span>Filters & Controls</span>
              </div>
              <Button onClick={handleRefresh} disabled={isLoading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-300">Search</label>
                <Input
                  placeholder="Filter by sender or subject"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/20 border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Filter by Date</label>
                <input
                  type="date"
                  value={filterDate ? filterDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFilterDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-black/20 text-white border border-white/20 rounded"
                />
              </div>
              <div className="flex flex-col justify-between space-y-2 md:space-y-0 md:flex-row md:items-end md:space-x-2">
                <div className="flex-1">
                  <label className="block text-sm mb-1 text-gray-300">
                    Number of messages: {maxResults[0]}
                  </label>
                  <Slider
                    value={maxResults}
                    onValueChange={handleSliderChange}
                    max={50}
                    min={1}
                    step={1}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="mt-2 md:mt-0"
                >
                  <FilterX className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Table */}
        <EmailTable messages={filteredMessages} isLoading={isLoading} />
      </div>
    </div>
  );
};
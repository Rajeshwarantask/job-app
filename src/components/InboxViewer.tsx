import React, { useState, useMemo } from 'react';
import { useGmailApi } from '../hooks/useGmailApi';
import { EmailTable } from './EmailTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/DateRangePicker';
import { 
  Search, 
  Filter, 
  Calendar,
  Mail,
  Building2,
  User,
  Clock,
  RefreshCw,
  Settings,
  X,
  Plus
} from 'lucide-react';

interface InboxViewerProps {
  searchQuery?: string;
  dateRange?: DateRange;
}

export const InboxViewer = ({ searchQuery: externalSearchQuery, dateRange: externalDateRange }: InboxViewerProps) => {
  const { messages, isLoading, fetchMessages, isAuthenticated } = useGmailApi();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(externalDateRange);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [senderFilter, setSenderFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [keywordFilter, setKeywordFilter] = useState<string>('');
  const [customKeywords, setCustomKeywords] = useState<string[]>([
    'interview', 'application', 'offer', 'rejected', 'assessment', 'coding challenge'
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [filterMode, setFilterMode] = useState<'manual' | 'auto'>('auto');

  // Auto-detected keywords for job-related emails
  const autoKeywords = [
    'application', 'interview', 'position', 'role', 'job', 'career', 'opportunity',
    'hiring', 'recruitment', 'hr', 'talent', 'offer', 'congratulations',
    'assessment', 'test', 'coding challenge', 'technical', 'shortlisted',
    'unfortunately', 'regret', 'not selected', 'thank you for applying'
  ];

  // Get unique values for filter dropdowns
  const uniqueSenders = useMemo(() => {
    const senders = messages.map(msg => {
      const emailMatch = msg.from.match(/<([^>]+)>/);
      return emailMatch ? emailMatch[1] : msg.from;
    });
    return [...new Set(senders)].sort();
  }, [messages]);

  const uniqueCompanies = useMemo(() => {
    const companies = messages.map(msg => {
      const domain = msg.from.match(/@([^.]+)\./);
      return domain ? domain[1] : 'Unknown';
    });
    return [...new Set(companies)].sort();
  }, [messages]);

  // Filter messages based on all criteria
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          message.subject.toLowerCase().includes(searchLower) ||
          message.from.toLowerCase().includes(searchLower) ||
          message.snippet.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (dateRange?.from || dateRange?.to) {
        const messageDate = new Date(message.date);
        if (dateRange.from && messageDate < dateRange.from) return false;
        if (dateRange.to && messageDate > dateRange.to) return false;
      }

      // Sender filter
      if (senderFilter !== 'all') {
        const emailMatch = message.from.match(/<([^>]+)>/);
        const senderEmail = emailMatch ? emailMatch[1] : message.from;
        if (senderEmail !== senderFilter) return false;
      }

      // Company filter
      if (companyFilter !== 'all') {
        const domain = message.from.match(/@([^.]+)\./);
        const company = domain ? domain[1] : 'Unknown';
        if (company !== companyFilter) return false;
      }

      // Keyword filter
      if (keywordFilter) {
        const activeKeywords = filterMode === 'auto' ? autoKeywords : customKeywords;
        const selectedKeywords = keywordFilter === 'all' ? activeKeywords : [keywordFilter];
        
        const messageText = (message.subject + ' ' + message.snippet).toLowerCase();
        const hasKeyword = selectedKeywords.some(keyword => 
          messageText.includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
      }

      return true;
    });
  }, [messages, searchQuery, dateRange, statusFilter, senderFilter, companyFilter, keywordFilter, filterMode, customKeywords, autoKeywords]);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !customKeywords.includes(newKeyword.trim())) {
      setCustomKeywords([...customKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setCustomKeywords(customKeywords.filter(k => k !== keyword));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDateRange(undefined);
    setStatusFilter('all');
    setSenderFilter('all');
    setCompanyFilter('all');
    setKeywordFilter('');
  };

  const activeFiltersCount = [
    searchQuery,
    dateRange?.from || dateRange?.to,
    statusFilter !== 'all',
    senderFilter !== 'all',
    companyFilter !== 'all',
    keywordFilter
  ].filter(Boolean).length;

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="min-h-screen bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Gmail Not Connected</h3>
              <p className="text-gray-400">
                Please connect your Gmail account to view your inbox.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gmail Inbox</h1>
              <p className="text-gray-300">
                {filteredMessages.length} of {messages.length} emails
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                  </Badge>
                )}
              </p>
            </div>
            <Button
              onClick={() => fetchMessages()}
              disabled={isLoading}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing...' : 'Refresh'}
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <DateRangePicker
                  date={dateRange}
                  onChange={setDateRange}
                  placeholder="Select date range"
                  icon={<Calendar className="h-4 w-4" />}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Sender</label>
                  <Select value={senderFilter} onValueChange={setSenderFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All senders" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All senders</SelectItem>
                      <SelectItem value="none">No selection</SelectItem>
                      <SelectItem value="clear">Clear selection</SelectItem>
                      {uniqueSenders.slice(0, 20).map(sender => (
                        <SelectItem key={sender} value={sender}>
                          {sender.length > 30 ? sender.substring(0, 30) + '...' : sender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Company</label>
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All companies" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All companies</SelectItem>
                      <SelectItem value="none">No selection</SelectItem>
                      <SelectItem value="clear">Clear selection</SelectItem>
                      {uniqueCompanies.slice(0, 20).map(company => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Keywords</label>
                  <Select value={keywordFilter} onValueChange={setKeywordFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All keywords" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All keywords</SelectItem>
                      <SelectItem value="none">No selection</SelectItem>
                      <SelectItem value="clear">Clear selection</SelectItem>
                      {["application", "interview", "offer", "rejected"].map((keyword) => (
                        <SelectItem key={keyword} value={keyword}>
                          {keyword}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Keyword Management */}
              <Tabs value={filterMode} onValueChange={(value) => setFilterMode(value as 'manual' | 'auto')}>
                <TabsList className="bg-white/10 border-white/20">
                  <TabsTrigger value="auto" className="text-white data-[state=active]:bg-white/20">
                    Auto Keywords
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="text-white data-[state=active]:bg-white/20">
                    Custom Keywords
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="auto" className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Automatically detected job-related keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {autoKeywords.map(keyword => (
                      <Badge
                        key={keyword}
                        className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom keyword..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <Button
                      onClick={handleAddKeyword}
                      size="sm"
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customKeywords.map(keyword => (
                      <Badge
                        key={keyword}
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs cursor-pointer hover:bg-purple-500/30"
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        {keyword}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  {customKeywords.length === 0 && (
                    <p className="text-sm text-gray-400">No custom keywords added yet</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Email Table */}
          <EmailTable messages={filteredMessages} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
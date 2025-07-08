import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Search, 
  RefreshCw, 
  Filter,
  Calendar,
  Building2,
  Eye,
  Trash2
} from 'lucide-react';

interface EmailData {
  id: string;
  subject: string;
  sender: string;
  company: string;
  snippet: string;
  date: Date;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'test' | null;
  confidence: number;
  isRead: boolean;
}

interface EmailInboxDisplayProps {
  isConnected: boolean;
  emails: EmailData[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const EmailInboxDisplay = ({ isConnected, emails, onRefresh, isLoading }: EmailInboxDisplayProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filteredEmails, setFilteredEmails] = useState<EmailData[]>(emails);

  useEffect(() => {
    let filtered = emails;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(email => email.status === filterStatus);
    }

    setFilteredEmails(filtered);
  }, [emails, searchTerm, filterStatus]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'applied': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'interview': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'test': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'offer': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-8 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Connect Gmail to View Emails</h3>
          <p className="text-gray-400">
            Once connected, your job-related emails will appear here automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Gmail Inbox
            <Badge className="ml-2 bg-blue-500/20 text-blue-300">
              {emails.length} emails
            </Badge>
          </CardTitle>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            size="sm"
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-md text-white appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="test">Test</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Email List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">
                {emails.length === 0 ? 'No emails found' : 'No emails match your filters'}
              </p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                className={`bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 ${
                  !email.isRead ? 'border-blue-500/30 bg-blue-500/5' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium truncate ${!email.isRead ? 'text-white' : 'text-gray-300'}`}>
                        {email.subject}
                      </h4>
                      {!email.isRead && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-3 w-3" />
                        <span>{email.company}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(email.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {email.status && (
                      <Badge className={`text-xs ${getStatusColor(email.status)}`}>
                        {email.status}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {Math.round(email.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {email.snippet}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    From: {email.sender}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-gray-400 hover:text-white"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-gray-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredEmails.length > 0 && (
          <div className="text-center pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Load More Emails
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
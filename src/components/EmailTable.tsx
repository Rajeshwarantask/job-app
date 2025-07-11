import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ParsedMessage } from '@/hooks/useGmailApi';
import { 
  Mail, 
  ExternalLink, 
  Calendar,
  User,
  MessageSquare,
  Inbox
} from 'lucide-react';

interface EmailTableProps {
  messages: ParsedMessage[];
  isLoading: boolean;
}

export const EmailTable = ({ messages, isLoading }: EmailTableProps) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatEmail = (email: string) => {
    // Extract email from "Name <email@domain.com>" format
    const match = email.match(/<([^>]+)>/);
    if (match) {
      return match[1];
    }
    return email;
  };

  const formatName = (email: string) => {
    // Extract name from "Name <email@domain.com>" format
    const match = email.match(/^([^<]+)</);
    if (match) {
      return match[1].trim().replace(/"/g, '');
    }
    return formatEmail(email);
  };

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your inbox messages...</p>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-8 text-center">
          <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Messages Found</h3>
          <p className="text-gray-400">Your inbox appears to be empty or no messages match the current filter.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Inbox Messages
          <Badge className="ml-2 bg-blue-500/20 text-blue-300">
            {messages.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">From</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Subject</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Preview</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-white text-sm font-medium">
                            {truncateText(formatName(message.from), 20)}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {truncateText(formatEmail(message.from), 25)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => window.open(message.gmailUrl, '_blank')}
                        className="text-left hover:text-blue-300 transition-colors"
                      >
                        <p className="text-white font-medium text-sm hover:underline">
                          {truncateText(message.subject, 40)}
                        </p>
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1 text-gray-400 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(message.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-300 text-sm">
                        {truncateText(message.snippet, 50)}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button
                        onClick={() => window.open(message.gmailUrl, '_blank')}
                        size="sm"
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="text-white font-medium text-sm truncate">
                      {formatName(message.from)}
                    </p>
                  </div>
                  <p className="text-gray-400 text-xs truncate">
                    {formatEmail(message.from)}
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-gray-400 text-xs">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(message.date).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => window.open(message.gmailUrl, '_blank')}
                className="text-left w-full mb-3 hover:text-blue-300 transition-colors"
              >
                <h4 className="text-white font-medium text-sm hover:underline mb-1">
                  {message.subject}
                </h4>
              </button>

              <div className="flex items-start space-x-2 mb-3">
                <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                <p className="text-gray-300 text-sm flex-1">
                  {truncateText(message.snippet, 100)}
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => window.open(message.gmailUrl, '_blank')}
                  size="sm"
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open in Gmail
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
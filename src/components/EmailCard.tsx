import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Mail, Building2, Clock, Star } from "lucide-react";
import { ProcessedEmail } from '@/services/gmailOAuthService';

interface EmailCardProps {
  email: ProcessedEmail;
  onCreateJob?: (email: ProcessedEmail) => void;
  onViewEmail?: (email: ProcessedEmail) => void;
}

const getStatusColor = (status: ProcessedEmail['status']) => {
  switch (status) {
    case 'applied': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'interview': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'offer': return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'test': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'text-green-400';
  if (confidence >= 0.6) return 'text-yellow-400';
  return 'text-red-400';
};

export const EmailCard = ({ email, onCreateJob, onViewEmail }: EmailCardProps) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Mail className="h-4 w-4 text-blue-400" />
              <h4 className="text-white font-semibold text-sm truncate">{email.subject}</h4>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="h-3 w-3 text-gray-400" />
              <p className="text-gray-300 text-sm truncate">{email.company}</p>
            </div>
          </div>
          
          {!email.isRead && (
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {email.status && (
              <Badge className={`text-xs ${getStatusColor(email.status)}`}>
                {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
              </Badge>
            )}
            
            <div className="flex items-center space-x-1">
              <Star className={`h-3 w-3 ${getConfidenceColor(email.confidence)}`} />
              <span className={`text-xs ${getConfidenceColor(email.confidence)}`}>
                {Math.round(email.confidence * 100)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formatDate(email.date)}</span>
          </div>
          
          <p className="text-xs text-gray-300 line-clamp-2 bg-white/5 p-2 rounded">
            {email.snippet}
          </p>

          <div className="flex items-center space-x-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
              onClick={() => onViewEmail?.(email)}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Email
            </Button>
            
            {onCreateJob && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-green-400 hover:text-green-300 p-0 h-auto"
                onClick={() => onCreateJob(email)}
              >
                <Clock className="h-3 w-3 mr-1" />
                Create Job
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
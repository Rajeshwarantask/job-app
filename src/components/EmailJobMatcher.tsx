import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGmail } from '@/context/GmailContext';
import { useJobs } from '@/context/JobsContext';
import { emailProcessor, EmailJobMatch } from '@/services/emailProcessor';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  CheckCircle, 
  Plus, 
  RefreshCw, 
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react';

export const EmailJobMatcher = () => {
  const { processedEmails } = useGmail();
  const { jobs, setJobs } = useJobs();
  const { toast } = useToast();
  const [matches, setMatches] = useState<EmailJobMatch[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (processedEmails.length > 0) {
      processEmailMatches();
    }
  }, [processedEmails, jobs]);

  const processEmailMatches = () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      const emailMatches = emailProcessor.processEmails(processedEmails, jobs);
      const relevantMatches = emailMatches.filter(match => 
        match.suggestedAction !== 'ignore' && match.confidence > 0.5
      );
      setMatches(relevantMatches);
      setIsProcessing(false);
    }, 1000);
  };

  const handleUpdateJobStatus = (match: EmailJobMatch) => {
    if (!match.matchedJob || !match.email.detectedStatus) return;

    const updatedJobs = jobs.map(job => 
      job.id === match.matchedJob!.id 
        ? { ...job, status: match.email.detectedStatus! }
        : job
    );

    setJobs(updatedJobs);
    
    // Remove this match from the list
    setMatches(matches.filter(m => m.email.messageId !== match.email.messageId));

    toast({
      title: "Job Status Updated",
      description: `${match.matchedJob.role} at ${match.matchedJob.company} status updated to ${match.email.detectedStatus}`,
    });
  };

  const handleCreateJob = (match: EmailJobMatch) => {
    const newJob = {
      ...emailProcessor.generateJobFromEmail(match.email),
      id: Date.now().toString()
    };

    setJobs([...jobs, newJob]);
    
    // Remove this match from the list
    setMatches(matches.filter(m => m.email.messageId !== match.email.messageId));

    toast({
      title: "Job Created",
      description: `New job application for ${newJob.role} at ${newJob.company} has been created`,
    });
  };

  const handleDismissMatch = (match: EmailJobMatch) => {
    setMatches(matches.filter(m => m.email.messageId !== match.email.messageId));
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'update_status': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'create_job': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-500/20 text-blue-300';
      case 'interview': return 'bg-purple-500/20 text-purple-300';
      case 'test': return 'bg-orange-500/20 text-orange-300';
      case 'offer': return 'bg-green-500/20 text-green-300';
      case 'rejected': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (matches.length === 0 && !isProcessing) {
    return null;
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Suggestions
          </span>
          {isProcessing && (
            <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isProcessing ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-300">Processing email matches...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.email.messageId} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate mb-1">
                      {match.email.subject}
                    </h4>
                    <p className="text-gray-400 text-sm mb-2">
                      From: {match.email.company} • {match.email.timestamp.toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2">
                      {match.email.detectedStatus && (
                        <Badge className={`text-xs ${getStatusColor(match.email.detectedStatus)}`}>
                          {match.email.detectedStatus}
                        </Badge>
                      )}
                      <Badge className={`text-xs ${getActionColor(match.suggestedAction)}`}>
                        {match.suggestedAction.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {Math.round(match.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissMatch(match)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {match.matchedJob && (
                  <div className="bg-white/5 rounded p-3 mb-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      <span>Matches: {match.matchedJob.role} at {match.matchedJob.company}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {match.suggestedAction === 'update_status' && match.matchedJob && (
                    <Button
                      onClick={() => handleUpdateJobStatus(match)}
                      size="sm"
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                  )}
                  
                  {match.suggestedAction === 'create_job' && (
                    <Button
                      onClick={() => handleCreateJob(match)}
                      size="sm"
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissMatch(match)}
                    className="text-gray-400 hover:text-white"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
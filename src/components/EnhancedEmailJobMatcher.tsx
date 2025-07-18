import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGmail } from '@/context/GmailContext';
import { useJobs } from '@/context/JobsContext';
import { intelligentEmailProcessor, IntelligentEmailMatch } from '@/services/intelligentEmailProcessor';
import { nlpService, JobStage } from '@/services/nlpService';
import { useToast } from '@/hooks/use-toast';
import { Brain, Mail, CheckCircle, Plus, RefreshCw, AlertTriangle, ArrowRight, X, TrendingUp, Target, Lightbulb, Zap, Eye, Baseline as Timeline } from 'lucide-react';

export const EnhancedEmailJobMatcher = () => {
  const { processedEmails } = useGmail();
  const { jobs, setJobs } = useJobs();
  const { toast } = useToast();
  const [matches, setMatches] = useState<IntelligentEmailMatch[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<IntelligentEmailMatch | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    if (processedEmails.length > 0) {
      processIntelligentMatches();
    }
  }, [processedEmails, jobs]);

  const processIntelligentMatches = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const intelligentMatches = intelligentEmailProcessor.processEmailsIntelligently(processedEmails, jobs);
      const relevantMatches = intelligentMatches.filter(match => 
        match.suggestedAction !== 'ignore' && match.confidence > 0.5
      );
      setMatches(relevantMatches);
      setIsProcessing(false);
    }, 1500);
  };

  const handleUpdateJobStatus = (match: IntelligentEmailMatch) => {
    if (!match.matchedJob) return;

    const newStatus = mapStageToJobStatus(match.classification.stage);
    const updatedJobs = jobs.map(job => 
      job.id === match.matchedJob!.id 
        ? { ...job, status: newStatus }
        : job
    );

    setJobs(updatedJobs);
    removeMatch(match);

    toast({
      title: "Job Status Updated",
      description: `${match.matchedJob.role} at ${match.matchedJob.company} updated to ${newStatus}`,
    });
  };

  const handleCreateJob = (match: IntelligentEmailMatch) => {
    const newJob = {
      id: Date.now().toString(),
      company: match.classification.entities.company || match.email.company,
      role: match.classification.entities.position || `Position at ${match.email.company}`,
      platform: 'Email Detection',
      applicationDate: match.email.date.toISOString().split('T')[0],
      status: mapStageToJobStatus(match.classification.stage),
      notes: `Auto-detected from email: ${match.email.subject}`,
      url: undefined,
      testDate: undefined,
      interviewDate: undefined
    };

    setJobs([...jobs, newJob]);
    removeMatch(match);

    toast({
      title: "Job Created",
      description: `New job application for ${newJob.role} at ${newJob.company} has been created`,
    });
  };

  const handleAddToTimeline = (match: IntelligentEmailMatch) => {
    if (!match.matchedJob) return;

    // In a real implementation, this would add the email to the job's timeline
    toast({
      title: "Added to Timeline",
      description: `Email added to ${match.matchedJob.role} timeline`,
    });
    
    removeMatch(match);
  };

  const removeMatch = (match: IntelligentEmailMatch) => {
    setMatches(matches.filter(m => m.email.id !== match.email.id));
  };

  const mapStageToJobStatus = (stage: JobStage): 'applied' | 'interview' | 'offer' | 'rejected' => {
    const stageMapping: Record<JobStage, 'applied' | 'interview' | 'offer' | 'rejected'> = {
      'application_submitted': 'applied',
      'application_received': 'applied',
      'under_review': 'applied',
      'shortlisted': 'applied',
      'assessment_invited': 'interview',
      'assessment_completed': 'interview',
      'interview_invited': 'interview',
      'interview_scheduled': 'interview',
      'interview_completed': 'interview',
      'reference_check': 'interview',
      'final_review': 'interview',
      'offer_extended': 'offer',
      'offer_accepted': 'offer',
      'offer_declined': 'offer',
      'rejected': 'rejected',
      'withdrawn': 'rejected'
    };

    return stageMapping[stage] || 'applied';
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'update_status': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'create_job': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'add_to_timeline': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStageColor = (stage: JobStage) => {
    if (stage.includes('offer')) return 'bg-green-500/20 text-green-300';
    if (stage.includes('interview')) return 'bg-purple-500/20 text-purple-300';
    if (stage.includes('assessment') || stage.includes('test')) return 'bg-orange-500/20 text-orange-300';
    if (stage.includes('rejected')) return 'bg-red-500/20 text-red-300';
    return 'bg-blue-500/20 text-blue-300';
  };

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'negative': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatStageName = (stage: JobStage) => {
    return stage.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (matches.length === 0 && !isProcessing) {
    return null;
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI-Powered Email Intelligence
            {isProcessing && (
              <RefreshCw className="h-4 w-4 ml-2 animate-spin text-blue-400" />
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
              className="text-gray-400 hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              {viewMode === 'overview' ? 'Detailed View' : 'Overview'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isProcessing ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 animate-pulse text-blue-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">AI Processing Emails...</h3>
            <p className="text-gray-300 mb-4">Analyzing content, extracting insights, and predicting stages</p>
            <Progress value={75} className="w-64 mx-auto" />
          </div>
        ) : (
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'overview' | 'detailed')}>
            <TabsList className="bg-white/10 border-white/20 mb-6">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
                <Target className="h-4 w-4 mr-2" />
                Smart Overview
              </TabsTrigger>
              <TabsTrigger value="detailed" className="text-white data-[state=active]:bg-white/20">
                <Timeline className="h-4 w-4 mr-2" />
                Detailed Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {matches.map((match) => (
                <div key={match.email.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate mb-2">
                        {match.email.subject}
                      </h4>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={`text-xs ${getStageColor(match.classification.stage)}`}>
                          {formatStageName(match.classification.stage)}
                        </Badge>
                        <Badge className={`text-xs ${getSentimentColor(match.classification.sentiment)}`}>
                          {match.classification.sentiment}
                        </Badge>
                        <Badge className={`text-xs ${getActionColor(match.suggestedAction)}`}>
                          {match.suggestedAction.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{match.email.company}</span>
                        <span>•</span>
                        <span>{match.email.date.toLocaleDateString()}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>{Math.round(match.confidence * 100)}% confidence</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMatch(match)}
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
                        {match.timelineConfidence && (
                          <Badge className="ml-2 bg-blue-500/20 text-blue-300 text-xs">
                            {Math.round(match.timelineConfidence.confidence * 100)}% timeline confidence
                          </Badge>
                        )}
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

                    {match.suggestedAction === 'add_to_timeline' && match.matchedJob && (
                      <Button
                        onClick={() => handleAddToTimeline(match)}
                        size="sm"
                        className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300"
                      >
                        <Timeline className="h-4 w-4 mr-2" />
                        Add to Timeline
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMatch(match)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Analyze
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              {matches.map((match) => (
                <Card key={match.email.id} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{match.email.subject}</CardTitle>
                      <div className="flex space-x-2">
                        <Badge className={`${getStageColor(match.classification.stage)}`}>
                          {formatStageName(match.classification.stage)}
                        </Badge>
                        <Badge className={`${getSentimentColor(match.classification.sentiment)}`}>
                          {match.classification.sentiment}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* AI Analysis */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="text-blue-300 font-medium mb-3 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        AI Analysis
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-white text-sm font-medium mb-2">Classification Confidence</h5>
                          <Progress value={match.classification.confidence * 100} className="mb-2" />
                          <p className="text-blue-200 text-xs">
                            {Math.round(match.classification.confidence * 100)}% confident this is {formatStageName(match.classification.stage)}
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="text-white text-sm font-medium mb-2">Match Confidence</h5>
                          <Progress value={match.confidence * 100} className="mb-2" />
                          <p className="text-blue-200 text-xs">
                            {Math.round(match.confidence * 100)}% confident about job matching
                          </p>
                        </div>
                      </div>

                      {match.classification.keywords.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-white text-sm font-medium mb-2">Detected Keywords</h5>
                          <div className="flex flex-wrap gap-2">
                            {match.classification.keywords.map(keyword => (
                              <Badge key={keyword} className="bg-blue-500/20 text-blue-300 text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Extracted Entities */}
                    {Object.keys(match.classification.entities).length > 0 && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                        <h4 className="text-purple-300 font-medium mb-3">Extracted Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {match.classification.entities.company && (
                            <div>
                              <span className="text-gray-400 text-xs">Company:</span>
                              <p className="text-white text-sm">{match.classification.entities.company}</p>
                            </div>
                          )}
                          {match.classification.entities.position && (
                            <div>
                              <span className="text-gray-400 text-xs">Position:</span>
                              <p className="text-white text-sm">{match.classification.entities.position}</p>
                            </div>
                          )}
                          {match.classification.entities.date && (
                            <div>
                              <span className="text-gray-400 text-xs">Date Mentioned:</span>
                              <p className="text-white text-sm">{match.classification.entities.date.toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline Confidence */}
                    {match.timelineConfidence && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <h4 className="text-green-300 font-medium mb-3 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Timeline Predictions
                        </h4>
                        
                        {match.timelineConfidence.reasoning.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-white text-sm font-medium mb-2">AI Reasoning</h5>
                            <ul className="text-green-200 text-sm space-y-1">
                              {match.timelineConfidence.reasoning.map((reason, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {match.timelineConfidence.nextPredictions.length > 0 && (
                          <div>
                            <h5 className="text-white text-sm font-medium mb-2">Next Stage Predictions</h5>
                            <div className="space-y-2">
                              {match.timelineConfidence.nextPredictions.map((prediction, index) => (
                                <div key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
                                  <span className="text-green-200 text-sm">
                                    {formatStageName(prediction.stage)}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-400">{prediction.timeframe}</span>
                                    <Badge className="bg-green-500/20 text-green-300 text-xs">
                                      {Math.round(prediction.probability * 100)}%
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-white/20">
                      {match.suggestedAction === 'update_status' && match.matchedJob && (
                        <Button
                          onClick={() => handleUpdateJobStatus(match)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Update to {formatStageName(match.classification.stage)}
                        </Button>
                      )}
                      
                      {match.suggestedAction === 'create_job' && (
                        <Button
                          onClick={() => handleCreateJob(match)}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-300"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Job
                        </Button>
                      )}

                      {match.suggestedAction === 'add_to_timeline' && match.matchedJob && (
                        <Button
                          onClick={() => handleAddToTimeline(match)}
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300"
                        >
                          <Timeline className="h-4 w-4 mr-2" />
                          Add to Timeline
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        onClick={() => removeMatch(match)}
                        className="text-gray-400 hover:text-white"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
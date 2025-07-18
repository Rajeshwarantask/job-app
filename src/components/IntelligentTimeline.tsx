import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobTimeline, IntelligentEmailMatch } from '@/services/intelligentEmailProcessor';
import { nlpService, JobStage } from '@/services/nlpService';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Brain,
  Mail,
  Calendar,
  Target,
  Lightbulb,
  Send,
  Copy,
  ExternalLink
} from 'lucide-react';

interface IntelligentTimelineProps {
  jobId: string;
  timeline: JobTimeline;
  emailMatches: IntelligentEmailMatch[];
  onUpdateStage: (stage: JobStage) => void;
  onSendEmail: (template: { subject: string; body: string }) => void;
}

export const IntelligentTimeline = ({ 
  jobId, 
  timeline, 
  emailMatches, 
  onUpdateStage,
  onSendEmail 
}: IntelligentTimelineProps) => {
  const [selectedStage, setSelectedStage] = useState<JobStage | null>(null);
  const [showPredictions, setShowPredictions] = useState(true);
  const [emailTemplate, setEmailTemplate] = useState<{ subject: string; body: string } | null>(null);

  const getStageIcon = (stage: JobStage, isCompleted: boolean, confidence: number) => {
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    if (confidence > 0.8) {
      return <Clock className="h-5 w-5 text-blue-500" />;
    }
    
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  const getStageColor = (stage: JobStage, isCompleted: boolean, confidence: number) => {
    if (isCompleted) return 'border-green-200 bg-green-50';
    if (confidence > 0.8) return 'border-blue-200 bg-blue-50';
    if (confidence > 0.6) return 'border-yellow-200 bg-yellow-50';
    return 'border-gray-200 bg-gray-50';
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

  const generateEmailTemplate = (type: 'follow_up' | 'thank_you' | 'status_inquiry') => {
    // Get job context from timeline
    const jobContext = {
      companyName: 'Company Name', // Would come from job data
      position: 'Position Title', // Would come from job data
      interviewerName: undefined,
      lastInteractionDate: timeline.stages[timeline.stages.length - 1]?.date
    };

    const template = nlpService.generateEmailTemplate(type, jobContext);
    setEmailTemplate(template);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Intelligence Overview */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Timeline Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-white font-medium">Current Stage</h3>
              <p className="text-gray-300 text-sm">{formatStageName(timeline.currentStage)}</p>
              <div className="mt-2">
                <Progress 
                  value={timeline.confidence.confidence * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round(timeline.confidence.confidence * 100)}% confidence
                </p>
              </div>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-white font-medium">Next Likely Stage</h3>
              {timeline.predictions.length > 0 ? (
                <>
                  <p className="text-gray-300 text-sm">
                    {formatStageName(timeline.predictions[0].stage)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.round(timeline.predictions[0].probability * 100)}% in {timeline.predictions[0].timeframe}
                  </p>
                </>
              ) : (
                <p className="text-gray-400 text-sm">No predictions available</p>
              )}
            </div>

            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-white font-medium">Email Insights</h3>
              <p className="text-gray-300 text-sm">{timeline.stages.length} tracked emails</p>
              <p className="text-xs text-gray-400 mt-1">
                Last update: {timeline.stages.length > 0 
                  ? timeline.stages[timeline.stages.length - 1].date.toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>

          {/* AI Reasoning */}
          {timeline.confidence.reasoning.length > 0 && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-blue-300 font-medium mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                AI Analysis
              </h4>
              <ul className="text-blue-200 text-sm space-y-1">
                {timeline.confidence.reasoning.map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Stages */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Intelligent Timeline
            </span>
            <Badge className="bg-blue-500/20 text-blue-300">
              {timeline.stages.length} stages tracked
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.stages.map((stage, index) => (
              <div key={index} className="relative flex items-start space-x-4">
                {/* Vertical line */}
                {index < timeline.stages.length - 1 && (
                  <div className="absolute left-[10px] top-8 h-full w-0.5 bg-white/20" />
                )}

                {/* Stage icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStageIcon(stage.stage, true, stage.confidence)}
                </div>

                {/* Stage content */}
                <div className="flex-1 bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{formatStageName(stage.stage)}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getSentimentColor(stage.sentiment)}`}>
                        {stage.sentiment}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {Math.round(stage.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{stage.date.toLocaleDateString()}</span>
                    {stage.emailId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Email
                      </Button>
                    )}
                  </div>

                  {stage.notes && (
                    <p className="text-gray-400 text-sm mt-2 bg-white/5 p-2 rounded">
                      {stage.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictions and Actions */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="predictions" className="text-white data-[state=active]:bg-white/20">
            Predictions
          </TabsTrigger>
          <TabsTrigger value="actions" className="text-white data-[state=active]:bg-white/20">
            Suggested Actions
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-white data-[state=active]:bg-white/20">
            Email Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Stage Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.predictions.length > 0 ? (
                <div className="space-y-3">
                  {timeline.predictions.map((prediction, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">
                          {formatStageName(prediction.stage)}
                        </h4>
                        <Badge className="bg-blue-500/20 text-blue-300">
                          {Math.round(prediction.probability * 100)}% likely
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          Expected timeframe: {prediction.timeframe}
                        </span>
                        <Progress 
                          value={prediction.probability * 100} 
                          className="w-24 h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No predictions available for current stage
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Suggested Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emailMatches.length > 0 && emailMatches[0].followUpSuggestions ? (
                <div className="space-y-3">
                  {emailMatches[0].followUpSuggestions.map((suggestion, index) => (
                    <Alert key={index} className={`
                      ${suggestion.urgency === 'high' ? 'bg-red-500/10 border-red-500/20' : 
                        suggestion.urgency === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' : 
                        'bg-blue-500/10 border-blue-500/20'}
                    `}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-white">
                        <div className="flex items-center justify-between">
                          <span>{suggestion.message}</span>
                          <div className="flex space-x-2">
                            <Badge className={`text-xs ${
                              suggestion.urgency === 'high' ? 'bg-red-500/20 text-red-300' :
                              suggestion.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {suggestion.urgency} priority
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => generateEmailTemplate(suggestion.type)}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                            >
                              Generate Email
                            </Button>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No actions suggested at this time
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Smart Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    onClick={() => generateEmailTemplate('follow_up')}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
                  >
                    Follow-up Email
                  </Button>
                  <Button
                    onClick={() => generateEmailTemplate('thank_you')}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                  >
                    Thank You Email
                  </Button>
                  <Button
                    onClick={() => generateEmailTemplate('status_inquiry')}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30"
                  >
                    Status Inquiry
                  </Button>
                </div>

                {emailTemplate && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">Generated Email Template</h4>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(emailTemplate.subject + '\n\n' + emailTemplate.body)}
                          className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-300"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onSendEmail(emailTemplate)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Send
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-1">Subject:</label>
                        <div className="bg-white/5 p-2 rounded border border-white/10">
                          <p className="text-white text-sm">{emailTemplate.subject}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-1">Body:</label>
                        <div className="bg-white/5 p-3 rounded border border-white/10">
                          <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                            {emailTemplate.body}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
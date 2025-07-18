import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { intelligentEmailProcessor } from '@/services/intelligentEmailProcessor';
import { useJobs } from '@/context/JobsContext';
import { useGmail } from '@/context/GmailContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  X,
  CheckCircle,
  Calendar,
  Mail,
  Zap
} from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';

interface ProactiveAlert {
  id: string;
  jobId: string;
  jobTitle?: string;
  type: 'follow_up_reminder' | 'stage_prediction' | 'deadline_warning' | 'opportunity_alert';
  message: string;
  urgency: 'low' | 'medium' | 'high';
  actionable: boolean;
  createdAt: Date;
  dismissed?: boolean;
}

const ErrorFallback = () => (
  <div className="text-center text-red-500">
    Something went wrong with alerts. Please try again later.
  </div>
);

export const ProactiveAlerts = () => {
  const { jobs } = useJobs();
  const { processedEmails } = useGmail();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    generateAlerts();
  }, [jobs, processedEmails]);

  const generateAlerts = () => {
    // Build timelines for all jobs
    const timelines = jobs.map(job => 
      intelligentEmailProcessor.buildJobTimeline(job.id, processedEmails)
    ).filter(timeline => timeline !== null); // Filter out null timelines

    // Generate proactive alerts
    const generatedAlerts = intelligentEmailProcessor.generateProactiveAlerts(timelines);
    
    // Convert to ProactiveAlert format with additional metadata
    const formattedAlerts: ProactiveAlert[] = generatedAlerts.map(alert => {
      const job = jobs.find(j => j.id === alert.jobId);
      return {
        id: `${alert.jobId}_${alert.type}_${Date.now()}`,
        jobId: alert.jobId,
        jobTitle: job ? `${job.role} at ${job.company}` : 'Unknown Job',
        type: alert.type,
        message: alert.message,
        urgency: alert.urgency,
        actionable: alert.actionable,
        createdAt: new Date(),
        dismissed: false
      };
    });

    setAlerts(prev => {
      // Merge with existing alerts, avoiding duplicates
      const existingIds = prev.map(a => `${a.jobId}_${a.type}`);
      const newAlerts = formattedAlerts.filter(a => 
        !existingIds.includes(`${a.jobId}_${a.type}`)
      );
      return [...prev, ...newAlerts];
    });
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
    
    toast({
      title: "Alert Dismissed",
      description: "The alert has been marked as dismissed.",
    });
  };

  const markAsActioned = (alertId: string) => {
    dismissAlert(alertId);
    toast({
      title: "Action Taken",
      description: "Great! The alert has been marked as completed.",
    });
  };

  const getAlertIcon = (type: ProactiveAlert['type']) => {
    switch (type) {
      case 'follow_up_reminder': return <Clock className="h-4 w-4" />;
      case 'stage_prediction': return <TrendingUp className="h-4 w-4" />;
      case 'deadline_warning': return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity_alert': return <Target className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertColor = (urgency: ProactiveAlert['urgency']) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/10 border-red-500/20 text-red-300';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300';
      case 'low': return 'bg-blue-500/10 border-blue-500/20 text-blue-300';
      default: return 'bg-gray-500/10 border-gray-500/20 text-gray-300';
    }
  };

  const getUrgencyBadge = (urgency: ProactiveAlert['urgency']) => {
    const colors = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };

    return (
      <Badge className={`text-xs ${colors[urgency]}`}>
        {urgency} priority
      </Badge>
    );
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const dismissedAlerts = alerts.filter(alert => alert.dismissed);

  if (activeAlerts.length === 0 && !showDismissed) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">All Caught Up!</h3>
          <p className="text-gray-400">No active alerts at the moment. Great job staying on top of your applications!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Proactive Alerts
              {activeAlerts.length > 0 && (
                <Badge className="ml-2 bg-red-500/20 text-red-300">
                  {activeAlerts.length} active
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDismissed(!showDismissed)}
                className="text-gray-400 hover:text-white"
              >
                {showDismissed ? 'Hide Dismissed' : `Show Dismissed (${dismissedAlerts.length})`}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateAlerts}
                className="text-gray-400 hover:text-white"
              >
                <Bell className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Active Alerts */}
            {activeAlerts.map((alert) => (
              <Alert key={alert.id} className={getAlertColor(alert.urgency)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-white text-sm">
                          {alert.jobTitle}
                        </h4>
                        {getUrgencyBadge(alert.urgency)}
                      </div>
                      <AlertDescription className="text-gray-300 text-sm">
                        {alert.message}
                      </AlertDescription>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {alert.createdAt.toLocaleDateString()}
                        </span>
                        <span className="capitalize">{alert.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {alert.actionable && (
                      <Button
                        size="sm"
                        onClick={() => markAsActioned(alert.id)}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Done
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}

            {/* Dismissed Alerts */}
            {showDismissed && dismissedAlerts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pt-4 border-t border-white/20">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                  <h4 className="text-gray-400 font-medium">Dismissed Alerts</h4>
                </div>
                
                {dismissedAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white/5 rounded-lg p-3 border border-white/10 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h5 className="text-white text-sm font-medium">{alert.jobTitle}</h5>
                          <p className="text-gray-400 text-xs">{alert.message}</p>
                        </div>
                      </div>
                      <Badge className="bg-gray-500/20 text-gray-400 text-xs">
                        Dismissed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alert Statistics */}
            {alerts.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">{activeAlerts.length}</div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-lg font-bold text-red-300">
                      {activeAlerts.filter(a => a.urgency === 'high').length}
                    </div>
                    <div className="text-xs text-gray-400">High Priority</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-300">
                      {activeAlerts.filter(a => a.actionable).length}
                    </div>
                    <div className="text-xs text-gray-400">Actionable</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-lg font-bold text-gray-300">{dismissedAlerts.length}</div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};
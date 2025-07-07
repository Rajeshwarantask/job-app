
import { Job } from "@/types/Job";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, Calendar, MapPin } from "lucide-react";

interface JobTimelineProps {
  job: Job;
}

interface TimelineStage {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming' | 'skipped';
  date?: string;
  details?: string;
  venue?: string;
  time?: string;
}

export const JobTimeline = ({ job }: JobTimelineProps) => {
  // Generate timeline stages based on job status and data
  const generateTimelineStages = (job: Job): TimelineStage[] => {
    const stages: TimelineStage[] = [
      {
        id: 'applied',
        title: 'Application Submitted',
        description: 'Application submitted',
        status: 'completed',
        date: job.applicationDate,
        details: `Applied via ${job.platform}`
      },
      {
        id: 'screening',
        title: 'Application Screening',
        description: 'Application screening',
        status: job.status === 'applied' ? 'current' : 'completed',
        date: job.status !== 'applied' ? job.applicationDate : undefined,
        details: 'Resume and profile review'
      },
      {
        id: 'shortlisting',
        title: 'Company Shortlisting',
        description: 'Shortlisting process',
        status: job.status === 'applied' ? 'upcoming' : 
               job.status === 'interview' || job.status === 'offer' ? 'completed' : 'current',
        details: 'Candidate selection phase'
      },
      {
        id: 'test',
        title: 'Online Test',
        description: 'Assessment/Technical test',
        status: job.testDate ? 'completed' : 
               job.status === 'interview' || job.status === 'offer' ? 'completed' :
               job.status === 'applied' ? 'upcoming' : 'current',
        date: job.testDate,
        details: job.testDate ? 'Technical assessment completed' : 'Technical assessment pending'
      },
      {
        id: 'interview',
        title: 'Interview',
        description: 'Interview round',
        status: job.status === 'interview' ? 'current' :
               job.status === 'offer' ? 'completed' :
               job.status === 'rejected' ? 'skipped' : 'upcoming',
        date: job.interviewDate,
        details: job.interviewDate ? 'Interview scheduled' : 'Interview pending'
      },
      {
        id: 'decision',
        title: job.status === 'offer' ? 'Offer Received' : 
               job.status === 'rejected' ? 'Application Rejected' : 'Final Decision',
        description: job.status === 'offer' ? 'Congratulations!' : 
                    job.status === 'rejected' ? 'Better luck next time' : 'Awaiting decision',
        status: job.status === 'offer' || job.status === 'rejected' ? 'completed' : 'upcoming',
        details: job.status === 'offer' ? 'Job offer received' :
                job.status === 'rejected' ? 'Application not selected' : 'Final decision pending'
      }
    ];

    return stages;
  };

  const timelineStages = generateTimelineStages(job);

  const getStageIcon = (status: TimelineStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStageColor = (status: TimelineStage['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'current':
        return 'border-blue-200 bg-blue-50';
      case 'skipped':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800">Application Timeline</h3>
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          In Progress
        </Badge>
      </div>

      <div className="relative">
        {timelineStages.map((stage, index) => (
          <div key={stage.id} className="relative flex items-start space-x-4 pb-8">
            {/* Timeline line */}
            {index < timelineStages.length - 1 && (
              <div className="absolute left-[10px] top-8 h-full w-0.5 bg-gray-200" />
            )}
            
            {/* Stage icon */}
            <div className="flex-shrink-0 mt-1">
              {getStageIcon(stage.status)}
            </div>

            {/* Stage content */}
            <Card className={`flex-1 ${getStageColor(stage.status)} border`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{stage.title}</h4>
                  {stage.date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(stage.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{stage.description}</p>
                
                {stage.details && (
                  <p className="text-xs text-gray-500">{stage.details}</p>
                )}

                {stage.venue && (
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {stage.venue}
                  </div>
                )}

                {stage.time && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {stage.time}
                  </div>
                )}

                {stage.status === 'current' && (
                  <div className="mt-3 text-xs text-blue-600 font-medium">
                    Current Stage
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};


import { Job } from "@/types/Job";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Trash2, Building2 } from "lucide-react";

interface JobListProps {
  jobs: Job[];
  onUpdateJobStatus: (jobId: string, status: Job['status']) => void;
  onDeleteJob: (jobId: string) => void;
}

const statusColors = {
  applied: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  interview: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  offer: 'bg-green-500/20 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30'
};

export const JobList = ({ jobs, onUpdateJobStatus, onDeleteJob }: JobListProps) => {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">{job.role}</h3>
                    <Badge className={`text-xs ${statusColors[job.status]}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {new Date(job.applicationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="bg-white/10 px-2 py-1 rounded text-xs">
                      {job.platform}
                    </div>
                  </div>

                  {job.notes && (
                    <p className="mt-2 text-sm text-gray-300 bg-white/5 p-3 rounded">
                      {job.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {job.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => window.open(job.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => onDeleteJob(job.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {jobs.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <p className="text-gray-400 text-lg">No job applications yet</p>
            <p className="text-gray-500 text-sm mt-2">Start tracking your job applications to see them here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

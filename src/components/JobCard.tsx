
import { Job } from "@/types/Job";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobCardProps {
  job: Job;
  onUpdateStatus: (jobId: string, status: Job['status']) => void;
  onDelete: (jobId: string) => void;
}

const statusColors = {
  applied: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  interview: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  offer: 'bg-green-500/20 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30'
};

const statusOptions = [
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' }
];

export const JobCard = ({ job, onUpdateStatus, onDelete }: JobCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm truncate">{job.role}</h4>
            <p className="text-gray-300 text-sm truncate">{job.company}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                onClick={() => navigate(`/job/${job.id}`)}
                className="text-gray-300 hover:bg-slate-700 hover:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {statusOptions.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => onUpdateStatus(job.id, status.value as Job['status'])}
                  disabled={job.status === status.value}
                  className="text-gray-300 hover:bg-slate-700 hover:text-white"
                >
                  Move to {status.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => onDelete(job.id)}
                className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <Badge className={`text-xs ${statusColors[job.status]}`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
          
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Applied {new Date(job.applicationDate).toLocaleDateString()}</span>
          </div>
          
          <div className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
            {job.platform}
          </div>

          {job.notes && (
            <p className="text-xs text-gray-300 line-clamp-2 bg-white/5 p-2 rounded">
              {job.notes}
            </p>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
              onClick={() => navigate(`/job/${job.id}`)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Timeline
            </Button>
            
            {job.url && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
                onClick={() => window.open(job.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Job
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

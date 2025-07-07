
import { Job } from "@/types/Job";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Calendar, CheckCircle, TrendingUp } from "lucide-react";

interface StatsOverviewProps {
  jobs: Job[];
}

export const StatsOverview = ({ jobs }: StatsOverviewProps) => {
  const stats = {
    total: jobs.length,
    applied: jobs.filter(job => job.status === 'applied').length,
    interviews: jobs.filter(job => job.status === 'interview').length,
    offers: jobs.filter(job => job.status === 'offer').length,
    responseRate: jobs.length > 0 ? Math.round(((jobs.filter(job => job.status !== 'applied').length) / jobs.length) * 100) : 0
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-4">
      <CardContent className="p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Briefcase className="h-4 w-4 text-blue-400" />
            <span className="text-white font-medium">{stats.total}</span>
            <span className="text-gray-300">Total</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-purple-400" />
            <span className="text-white font-medium">{stats.interviews}</span>
            <span className="text-gray-300">Interviews</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-white font-medium">{stats.offers}</span>
            <span className="text-gray-300">Offers</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            <span className="text-white font-medium">{stats.responseRate}%</span>
            <span className="text-gray-300">Response</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

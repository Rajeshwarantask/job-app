
import { Job } from "@/types/Job";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Calendar, CheckCircle, TrendingUp, Mail } from "lucide-react";
import { ProcessedEmail } from '@/services/gmailOAuthService';

interface StatsOverviewProps {
  jobs: Job[];
  emails?: ProcessedEmail[];
}

export const StatsOverview = ({ jobs, emails = [] }: StatsOverviewProps) => {
  const stats = {
    total: jobs.length,
    applied: jobs.filter(job => job.status === 'applied').length,
    interviews: jobs.filter(job => job.status === 'interview').length,
    offers: jobs.filter(job => job.status === 'offer').length,
    responseRate: jobs.length > 0 ? Math.round(((jobs.filter(job => job.status !== 'applied').length) / jobs.length) * 100) : 0,
    newEmails: emails.filter(email => email.confidence > 0.6).length,
    unreadEmails: emails.filter(email => !email.isRead && email.confidence > 0.6).length
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-4">
      <CardContent className="p-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
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
          
          <div className="flex items-center space-x-1">
            <Mail className="h-4 w-4 text-cyan-400" />
            <span className="text-white font-medium">{stats.newEmails}</span>
            <span className="text-gray-300">AI Detected</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="h-4 w-4 bg-blue-400 rounded-full"></div>
            <span className="text-white font-medium">{stats.unreadEmails}</span>
            <span className="text-gray-300">Unread</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

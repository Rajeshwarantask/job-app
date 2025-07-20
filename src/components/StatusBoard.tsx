
import { Job } from "@/types/Job";
import { JobCard } from "@/components/JobCard";
import { EmailCard } from "@/components/EmailCard";
import { ProcessedEmail } from '@/services/gmailOAuthService';
import { intelligentEmailProcessor } from '@/services/intelligentEmailProcessor';

interface StatusBoardProps {
  jobs: Job[];
  emails: ProcessedEmail[];
  onUpdateJobStatus: (jobId: string, status: Job['status']) => void;
  onDeleteJob: (jobId: string) => void;
  onCreateJobFromEmail?: (email: ProcessedEmail) => void;
  onViewEmail?: (email: ProcessedEmail) => void;
}

const statusColumns = [
  { key: 'applied' as const, title: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { key: 'interview' as const, title: 'Interview', color: 'bg-purple-100 text-purple-800' },
  { key: 'offer' as const, title: 'Offer', color: 'bg-green-100 text-green-800' },
  { key: 'rejected' as const, title: 'Rejected', color: 'bg-red-100 text-red-800' }
];

export const StatusBoard = ({ 
  jobs, 
  emails, 
  onUpdateJobStatus, 
  onDeleteJob, 
  onCreateJobFromEmail,
  onViewEmail 
}: StatusBoardProps) => {
  
  // Group emails by detected status
  const emailsByStatus = emails.reduce((acc, email) => {
    if (email.status && email.confidence > 0.6) { // Only show high-confidence emails
      if (!acc[email.status]) acc[email.status] = [];
      acc[email.status].push(email);
    }
    return acc;
  }, {} as Record<string, ProcessedEmail[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusColumns.map((column) => {
        const columnJobs = jobs.filter(job => job.status === column.key);
        const columnEmails = emailsByStatus[column.key] || [];
        const totalItems = columnJobs.length + columnEmails.length;
        
        return (
          <div
  key={column.key}
  className="rounded-lg border border-white/30 text-card-foreground shadow-sm bg-white/0 backdrop-blur-sm hover:bg-white/2 transition-all duration-300 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[cornflowerblue]">{column.title}</h3>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${column.color}`}>
                  {totalItems}
                </span>
                {columnEmails.length > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {columnEmails.length} new
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto">
              {/* Display Gmail Emails First (New Items) */}
              {columnEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  onCreateJob={onCreateJobFromEmail}
                  onViewEmail={onViewEmail}
                />
              ))}
              
              {/* Display Existing Jobs */}
              {columnJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onUpdateStatus={onUpdateJobStatus}
                  onDelete={onDeleteJob}
                />
              ))}
              
              {totalItems === 0 && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500 text-sm">No applications in this stage</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

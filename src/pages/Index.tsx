import { useState } from "react";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { JobForm } from "@/components/JobForm";
import { EmailJobMatcher } from "@/components/EmailJobMatcher";
import { Job } from "@/types/Job";
import { useGmail } from "@/context/GmailContext";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const { processedEmails, isConnected } = useGmail();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      company: 'Google',
      role: 'Software Engineer Intern',
      platform: 'LinkedIn',
      applicationDate: '2024-07-01',
      status: 'interview',
      notes: 'Great company culture, technical interview scheduled',
      interviewDate: '2024-07-10',
    },
    {
      id: '2',
      company: 'Microsoft',
      role: 'Product Manager Intern',
      platform: 'Company Website',
      applicationDate: '2024-06-25',
      status: 'applied',
      notes: 'Applied through career portal',
    },
    {
      id: '3',
      company: 'Meta',
      role: 'Frontend Developer',
      platform: 'Internshala',
      applicationDate: '2024-06-20',
      status: 'offer',
      notes: 'Received offer! Great team and compensation'
    }
  ]);

  const [showJobForm, setShowJobForm] = useState(false);

  const handleAddJob = () => {
    setShowJobForm(true);
  };

  const handleCloseJobForm = () => {
    setShowJobForm(false);
  };

  const handleJobSubmit = (jobData: Omit<Job, 'id'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString()
    };
    setJobs([...jobs, newJob]);
    setShowJobForm(false);
  };

  const updateJobStatus = (jobId: string, newStatus: Job['status']) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
  };

  const deleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        <Header onAddJob={handleAddJob} />
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Enhanced Email Job Matcher */}
          {isConnected && processedEmails.length > 0 && (
            <EmailJobMatcher 
              emails={processedEmails}
              jobs={jobs}
              onCreateJob={handleJobSubmit}
              onUpdateJobStatus={updateJobStatus}
            />
          )}
          
          <Dashboard 
            jobs={jobs}
            emails={processedEmails}
            onUpdateJobStatus={updateJobStatus}
            onDeleteJob={deleteJob}
          />
        </main>
        {showJobForm && (
          <JobForm 
            onClose={handleCloseJobForm}
            onSubmit={handleJobSubmit}
          />
        )}
      </div>
    </div>
  );
}
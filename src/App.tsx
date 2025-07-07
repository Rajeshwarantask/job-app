import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmailSettings from "./pages/EmailSettings";
import JobDetail from "./pages/JobDetail";
import Analytics from "./pages/Analytics";
import { JobsProvider } from "@/context/JobsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <JobsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/job/:jobId" element={<JobDetailRoute />} />
            <Route path="/analytics" element={<AnalyticsRoute />} />
            <Route path="/email-settings" element={<EmailSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </JobsProvider>
  </QueryClientProvider>
);

// Route wrapper to pass props to JobDetail
const JobDetailRoute = () => {
  // This is a temporary solution - in a real app you'd use context or state management
  const [jobs] = useState([
    {
      id: '1',
      company: 'Google',
      role: 'Software Engineer Intern',
      platform: 'LinkedIn',
      applicationDate: '2024-07-01',
      status: 'interview' as const,
      notes: 'Great company culture, technical interview scheduled',
      interviewDate: '2024-07-10'
    },
    {
      id: '2',
      company: 'Microsoft',
      role: 'Product Manager Intern',
      platform: 'Company Website',
      applicationDate: '2024-06-25',
      status: 'applied' as const,
      notes: 'Applied through career portal'
    },
    {
      id: '3',
      company: 'Meta',
      role: 'Frontend Developer',
      platform: 'Internshala',
      applicationDate: '2024-06-20',
      status: 'offer' as const,
      notes: 'Received offer! Great team and compensation'
    }
  ]);

  const updateJobStatus = (jobId: string, newStatus: string) => {
    console.log('Updating job status:', jobId, newStatus);
  };

  return <JobDetail jobs={jobs} onUpdateJobStatus={updateJobStatus} />;
};

// Route wrapper to pass props to Analytics
const AnalyticsRoute = () => {
  // This is a temporary solution - in a real app you'd use context or state management
  const [jobs] = useState([
    {
      id: '1',
      company: 'Google',
      role: 'Software Engineer Intern',
      platform: 'LinkedIn',
      applicationDate: '2024-07-01',
      status: 'interview' as const,
      notes: 'Great company culture, technical interview scheduled',
      interviewDate: '2024-07-10'
    },
    {
      id: '2',
      company: 'Microsoft',
      role: 'Product Manager Intern',
      platform: 'Company Website',
      applicationDate: '2024-06-25',
      status: 'applied' as const,
      notes: 'Applied through career portal'
    },
    {
      id: '3',
      company: 'Meta',
      role: 'Frontend Developer',
      platform: 'Internshala',
      applicationDate: '2024-06-20',
      status: 'offer' as const,
      notes: 'Received offer! Great team and compensation'
    },
    {
      id: '4',
      company: 'Apple',
      role: 'iOS Developer',
      platform: 'LinkedIn',
      applicationDate: '2024-06-15',
      status: 'rejected' as const,
      notes: 'Did not move forward after initial screening'
    },
    {
      id: '5',
      company: 'Amazon',
      role: 'Software Engineer',
      platform: 'Indeed',
      applicationDate: '2024-06-10',
      status: 'interview' as const,
      notes: 'Scheduled for technical round'
    }
  ]);

  return <Analytics jobs={jobs} />;
};

export default App;

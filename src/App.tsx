import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { JobsProvider } from "@/context/JobsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import EmailSettings from "./pages/EmailSettings";
import JobDetail from "./pages/JobDetail";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <JobsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/job/:jobId" element={
                <ProtectedRoute>
                  <JobDetailRoute />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AnalyticsRoute />
                </ProtectedRoute>
              } />
              <Route path="/email-settings" element={
                <ProtectedRoute>
                  <EmailSettings />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </JobsProvider>
    </AuthProvider>
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
  return <Analytics />;
};

export default App;
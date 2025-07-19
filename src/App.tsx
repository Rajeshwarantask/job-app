import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { JobsProvider } from "@/context/JobsContext";
import { GmailProvider } from "@/context/GmailContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdateNotification } from "@/components/PWAUpdateNotification";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthCallback } from './pages/AuthCallback';
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import EmailSettings from "./pages/EmailSettings";
import JobDetail from "./pages/JobDetail";
import Analytics from "./pages/Analytics";
import InboxPage from "./pages/InboxPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAInstallPrompt />
      <PWAUpdateNotification />
      <OfflineIndicator />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <GmailProvider>
                  <JobsProvider>
                    <Index />
                  </JobsProvider>
                </GmailProvider>
              </ProtectedRoute>
            } />
            <Route path="/job/:jobId" element={
              <ProtectedRoute>
                <GmailProvider>
                  <JobsProvider>
                    <JobDetailRoute />
                  </JobsProvider>
                </GmailProvider>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <GmailProvider>
                  <JobsProvider>
                    <AnalyticsRoute />
                  </JobsProvider>
                </GmailProvider>
              </ProtectedRoute>
            } />
            <Route path="/inbox" element={
              <ProtectedRoute>
                <GmailProvider>
                  <InboxPage />
                </GmailProvider>
              </ProtectedRoute>
            } />
            <Route path="/email-settings" element={
              <ProtectedRoute>
                <GmailProvider>
                  <JobsProvider>
                    <EmailSettings />
                  </JobsProvider>
                </GmailProvider>
              </ProtectedRoute>
            } />
            
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
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
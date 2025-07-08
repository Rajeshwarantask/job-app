import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { realGmailService, EmailData, GmailCredentials } from '@/services/realGmailService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GmailContextType {
  hasCredentials: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  lastSync: Date | null;
  processedEmails: EmailData[];
  userEmail: string | null;
  setCredentials: (credentials: GmailCredentials) => void;
  connectGmail: () => Promise<void>;
  disconnectGmail: () => Promise<void>;
  syncEmails: () => Promise<void>;
  getConnectionStatus: () => boolean;
}

const GmailContext = createContext<GmailContextType | undefined>(undefined);

export const GmailProvider = ({ children }: { children: ReactNode }) => {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [processedEmails, setProcessedEmails] = useState<EmailData[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkStoredCredentials();
      checkGmailConnection();
      loadProcessedEmails();
    }
  }, [user]);

  const checkStoredCredentials = () => {
    try {
      const stored = localStorage.getItem(`gmail_credentials_${user?.id}`);
      if (stored) {
        const credentials = JSON.parse(stored);
        realGmailService.setCredentials(credentials);
        setHasCredentials(true);
      }
    } catch (error) {
      console.error('Error checking stored credentials:', error);
    }
  };

  const checkGmailConnection = () => {
    try {
      const tokens = localStorage.getItem(`gmail_tokens_${user?.id}`);
      const connected = localStorage.getItem(`gmail_connected_${user?.id}`);
      const email = localStorage.getItem(`gmail_user_email_${user?.id}`);
      
      if (tokens && connected === 'true') {
        const parsedTokens = JSON.parse(tokens);
        realGmailService.setTokens(parsedTokens);
        setIsConnected(true);
        setUserEmail(email);
        
        const lastSyncStr = localStorage.getItem(`gmail_last_sync_${user?.id}`);
        if (lastSyncStr) {
          setLastSync(new Date(lastSyncStr));
        }
      }
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setIsConnected(false);
    }
  };

  const loadProcessedEmails = () => {
    try {
      const stored = localStorage.getItem(`gmail_processed_emails_${user?.id}`);
      if (stored) {
        const emails = JSON.parse(stored).map((email: any) => ({
          ...email,
          date: new Date(email.date)
        }));
        setProcessedEmails(emails);
      }
    } catch (error) {
      console.error('Error loading processed emails:', error);
    }
  };

  const saveProcessedEmails = (emails: EmailData[]) => {
    try {
      localStorage.setItem(`gmail_processed_emails_${user?.id}`, JSON.stringify(emails));
      setProcessedEmails(emails);
    } catch (error) {
      console.error('Error saving processed emails:', error);
    }
  };

  const setCredentials = (credentials: GmailCredentials) => {
    if (!user) return;

    try {
      localStorage.setItem(`gmail_credentials_${user.id}`, JSON.stringify(credentials));
      realGmailService.setCredentials(credentials);
      setHasCredentials(true);

      toast({
        title: "Credentials Saved",
        description: "Google OAuth credentials have been configured successfully.",
      });
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save credentials. Please try again.",
        variant: "destructive"
      });
    }
  };

  const connectGmail = async () => {
    if (!user || !hasCredentials) return;

    setIsConnecting(true);
    try {
      // Get authorization URL and redirect user
      const authUrl = realGmailService.getAuthUrl();
      
      // Open popup window for OAuth
      const popup = window.open(
        authUrl,
        'gmail-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for the OAuth callback
      const handleCallback = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
          const { code } = event.data;
          
          try {
            // Exchange code for tokens
            const tokens = await realGmailService.exchangeCodeForTokens(code);
            
            // Get user info
            const userInfo = await realGmailService.getUserInfo();
            
            // Store tokens and user info
            localStorage.setItem(`gmail_tokens_${user.id}`, JSON.stringify(tokens));
            localStorage.setItem(`gmail_connected_${user.id}`, 'true');
            localStorage.setItem(`gmail_user_email_${user.id}`, userInfo.email);
            
            setIsConnected(true);
            setUserEmail(userInfo.email);
            
            toast({
              title: "Gmail Connected!",
              description: `Successfully connected ${userInfo.email}`,
            });

            // Perform initial sync
            await syncEmails();
            
          } catch (error) {
            console.error('Error during OAuth callback:', error);
            toast({
              title: "Connection Failed",
              description: "Failed to complete Gmail connection. Please try again.",
              variant: "destructive"
            });
          }
          
          popup?.close();
          window.removeEventListener('message', handleCallback);
        } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
          toast({
            title: "Connection Cancelled",
            description: "Gmail connection was cancelled or failed.",
            variant: "destructive"
          });
          popup?.close();
          window.removeEventListener('message', handleCallback);
        }
      };

      window.addEventListener('message', handleCallback);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleCallback);
          setIsConnecting(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Error initiating OAuth:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to start Gmail connection. Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // For development/demo purposes - simulate connection
  const connectGmailDemo = async () => {
    if (!user || !hasCredentials) return;

    setIsConnecting(true);
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTokens = {
        access_token: 'demo_access_token',
        refresh_token: 'demo_refresh_token',
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        token_type: 'Bearer',
        expiry_date: Date.now() + 3600000
      };

      localStorage.setItem(`gmail_tokens_${user.id}`, JSON.stringify(mockTokens));
      localStorage.setItem(`gmail_connected_${user.id}`, 'true');
      localStorage.setItem(`gmail_user_email_${user.id}`, user.email);
      
      setIsConnected(true);
      setUserEmail(user.email);

      toast({
        title: "Gmail Connected! (Demo Mode)",
        description: "Demo connection established. Showing sample emails.",
      });

      await syncEmailsDemo();
    } catch (error) {
      console.error('Error connecting Gmail:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Gmail. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGmail = async () => {
    if (!user) return;

    try {
      await realGmailService.revokeAccess();
      
      // Clear stored data
      localStorage.removeItem(`gmail_credentials_${user.id}`);
      localStorage.removeItem(`gmail_tokens_${user.id}`);
      localStorage.removeItem(`gmail_connected_${user.id}`);
      localStorage.removeItem(`gmail_user_email_${user.id}`);
      localStorage.removeItem(`gmail_last_sync_${user.id}`);
      localStorage.removeItem(`gmail_processed_emails_${user.id}`);
      
      setIsConnected(false);
      setUserEmail(null);
      setLastSync(null);
      setProcessedEmails([]);

      toast({
        title: "Gmail Disconnected",
        description: "Your Gmail account has been disconnected from JobTrail.",
      });

    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      toast({
        title: "Disconnection Failed",
        description: "Unable to disconnect Gmail. Please try again.",
        variant: "destructive"
      });
    }
  };

  const syncEmails = async () => {
    if (!user || !isConnected) return;

    try {
      const emails = await realGmailService.fetchEmails(50);
      
      const currentTime = new Date();
      saveProcessedEmails(emails);
      setLastSync(currentTime);
      localStorage.setItem(`gmail_last_sync_${user.id}`, currentTime.toISOString());

      toast({
        title: "Emails Synced",
        description: `Found ${emails.length} job-related emails.`,
      });
    } catch (error) {
      console.error('Error syncing emails:', error);
      toast({
        title: "Sync Failed",
        description: "Unable to sync emails. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Demo version for development
  const syncEmailsDemo = async () => {
    if (!user || !isConnected) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockEmails: EmailData[] = [
        {
          id: 'demo_1',
          company: 'Google',
          subject: 'Thank you for your application - Software Engineer',
          sender: 'noreply@google.com',
          snippet: 'Thank you for applying to the Software Engineer position at Google...',
          date: new Date(Date.now() - 86400000),
          status: 'applied',
          confidence: 0.9,
          isRead: true
        },
        {
          id: 'demo_2',
          company: 'Microsoft',
          subject: 'Interview Invitation - Product Manager Role',
          sender: 'careers@microsoft.com',
          snippet: 'We are pleased to invite you for an interview for the Product Manager position...',
          date: new Date(Date.now() - 43200000),
          status: 'interview',
          confidence: 0.95,
          isRead: false
        },
        {
          id: 'demo_3',
          company: 'Meta',
          subject: 'Coding Challenge - Frontend Developer',
          sender: 'recruiting@meta.com',
          snippet: 'Please complete the following coding challenge for the Frontend Developer role...',
          date: new Date(Date.now() - 21600000),
          status: 'test',
          confidence: 0.85,
          isRead: false
        }
      ];

      const currentTime = new Date();
      saveProcessedEmails(mockEmails);
      setLastSync(currentTime);
      localStorage.setItem(`gmail_last_sync_${user.id}`, currentTime.toISOString());

      toast({
        title: "Demo Emails Loaded",
        description: `Found ${mockEmails.length} new job-related emails.`,
      });
    } catch (error) {
      console.error('Error syncing emails:', error);
      toast({
        title: "Sync Failed",
        description: "Unable to sync emails. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getConnectionStatus = () => isConnected;

  const value = {
    hasCredentials,
    isConnected,
    isConnecting,
    lastSync,
    processedEmails,
    userEmail,
    setCredentials,
    connectGmail,
    disconnectGmail,
    syncEmails: process.env.NODE_ENV === 'development' ? syncEmailsDemo : syncEmails,
    getConnectionStatus
  };

  return (
    <GmailContext.Provider value={value}>
      {children}
    </GmailContext.Provider>
  );
};

export const useGmail = () => {
  const context = useContext(GmailContext);
  if (!context) {
    throw new Error('useGmail must be used within a GmailProvider');
  }
  return context;
};
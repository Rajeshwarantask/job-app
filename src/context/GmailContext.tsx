import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gmailOAuthService, GmailCredentials, ProcessedEmail } from '@/services/gmailOAuthService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GmailContextType {
  hasCredentials: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  lastSync: Date | null;
  processedEmails: ProcessedEmail[];
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
  const [processedEmails, setProcessedEmails] = useState<ProcessedEmail[]>([]);
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
        gmailOAuthService.setCredentials(credentials);
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
        gmailOAuthService.setTokens(parsedTokens);
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

  const saveProcessedEmails = (emails: ProcessedEmail[]) => {
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
      const credentialsWithRedirect = {
        ...credentials,
        redirectUri: `${window.location.origin}/auth/callback`
      };

      localStorage.setItem(`gmail_credentials_${user.id}`, JSON.stringify(credentialsWithRedirect));
      gmailOAuthService.setCredentials(credentialsWithRedirect);
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
    if (!user || !hasCredentials) {
      toast({
        title: "Configuration Required",
        description: "Please set up your OAuth credentials first.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Get authorization URL and redirect user
      const authUrl = gmailOAuthService.getAuthUrl();
      
      // Open popup window for OAuth
      const popup = window.open(
        authUrl,
        'gmail-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for the OAuth callback
      const handleCallback = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
          const { code } = event.data;
          
          try {
            // Exchange code for tokens
            const tokens = await gmailOAuthService.exchangeCodeForTokens(code);
            
            // Get user info
            const userInfo = await gmailOAuthService.getUserInfo();
            
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast({
              title: "Connection Failed",
              description: errorMessage,
              variant: "destructive"
            });
          }
          
          popup?.close();
          window.removeEventListener('message', handleCallback);
        } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
          const errorMessage = event.data.error === 'deleted_client' 
            ? "OAuth client has been deleted. Please reconfigure your Google Cloud Console settings."
            : event.data.error === 'access_denied'
            ? "Access was denied. Please grant permission to continue."
            : "Gmail connection failed. Please try again.";
            
          toast({
            title: event.data.error === 'deleted_client' ? "Configuration Error" : "Connection Failed",
            description: errorMessage,
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGmail = async () => {
    if (!user) return;

    try {
      await gmailOAuthService.revokeAccess();
      
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
      const emails = await gmailOAuthService.fetchEmails(50);
      
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Handle authentication errors
      if (errorMessage.includes('Authentication expired')) {
        setIsConnected(false);
        localStorage.setItem(`gmail_connected_${user.id}`, 'false');
        toast({
          title: "Authentication Expired",
          description: "Please reconnect your Gmail account.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sync Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
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
    syncEmails,
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
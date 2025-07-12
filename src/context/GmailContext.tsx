import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  gmailOAuthService,
  GmailCredentials,
  ProcessedEmail,
} from '@/services/gmailOAuthService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom'; 

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) restoreSession();
  }, [user]);

  // Unified restoration logic
  const restoreSession = () => {
    try {
      const credentials = localStorage.getItem(`gmail_credentials_${user?.id}`);
      const tokens = localStorage.getItem(`gmail_tokens_${user?.id}`);
      const connected = localStorage.getItem(`gmail_connected_${user?.id}`);
      const email = localStorage.getItem(`gmail_user_email_${user?.id}`);
      const lastSyncStr = localStorage.getItem(`gmail_last_sync_${user?.id}`);
      const storedEmails = localStorage.getItem(`gmail_processed_emails_${user?.id}`);

      if (credentials) {
        gmailOAuthService.setCredentials(JSON.parse(credentials));
        setHasCredentials(true);
      }

      if (tokens && connected === 'true') {
        gmailOAuthService.setTokens(JSON.parse(tokens));
        setIsConnected(true);
        setUserEmail(email);
        if (lastSyncStr) setLastSync(new Date(lastSyncStr));
      }

      if (storedEmails) {
        const emails = JSON.parse(storedEmails).map((email: any) => ({
          ...email,
          date: new Date(email.date),
        }));
        setProcessedEmails(emails);
      }
    } catch (error) {
      console.error('Session restoration error:', error);
    }
  };

  const saveProcessedEmails = (emails: ProcessedEmail[]) => {
    try {
      localStorage.setItem(
        `gmail_processed_emails_${user?.id}`,
        JSON.stringify(emails)
      );
      setProcessedEmails(emails);
    } catch (error) {
      console.error('Error saving processed emails:', error);
    }
  };

  const setCredentials = useCallback(
    (credentials: GmailCredentials) => {
      if (!user) return;

      try {
        const credentialsWithRedirect = {
          ...credentials,
          redirectUri: `${window.location.origin}/auth-callback.html`,
        };

        localStorage.setItem(
          `gmail_credentials_${user.id}`,
          JSON.stringify(credentialsWithRedirect)
        );
        gmailOAuthService.setCredentials(credentialsWithRedirect);
        setHasCredentials(true);

        toast({
          title: 'Credentials Saved',
          description: 'Google OAuth credentials have been configured successfully.',
        });
      } catch (error) {
        console.error('Error saving credentials:', error);
        toast({
          title: 'Error',
          description: 'Failed to save credentials. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [user, toast]
  );

  const connectGmail = useCallback(async () => {
    if (!user || !hasCredentials) {
      toast({
        title: 'Configuration Required',
        description: 'Please set up your OAuth credentials first.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);

    try {
      const authUrl = gmailOAuthService.getAuthUrl();
      const popup = window.open(
        authUrl,
        'gmail-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        localStorage.setItem('gmail_auth_return_url', '/inbox');
        window.location.href = authUrl;
        return;
      }

      const handleCallback = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        console.log('Received OAuth callback:', event.data);
        clearTimeout(timeout);

        if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
          try {
            const { code } = event.data;
            console.log('Processing OAuth code...');
            const tokens = await gmailOAuthService.exchangeCodeForTokens(code);
            const userInfo = await gmailOAuthService.getUserInfo();

            localStorage.setItem(`gmail_tokens_${user.id}`, JSON.stringify(tokens));
            localStorage.setItem(`gmail_connected_${user.id}`, 'true');
            localStorage.setItem(`gmail_user_email_${user.id}`, userInfo.email);

            setIsConnected(true);
            setUserEmail(userInfo.email);

            toast({
              title: 'Gmail Connected!',
              description: `Successfully connected ${userInfo.email}`,
            });

            // Close popup first
            popup?.close();
            window.removeEventListener('message', handleCallback);
            
            // Sync emails and navigate to inbox
            await syncEmails();
            navigate('/inbox');
          } catch (error) {
            console.error('OAuth processing error:', error);
            handleOAuthError(error);
            popup?.close();
            window.removeEventListener('message', handleCallback);
          }
        } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
          console.error('OAuth error:', event.data.error);
          handleOAuthError(event.data.error);
          popup?.close();
          window.removeEventListener('message', handleCallback);
        }
      };
      
      window.addEventListener('message', handleCallback);

      const timeout = setTimeout(() => {
        console.log('OAuth timeout');
        toast({
          title: 'OAuth Timeout',
          description: 'Google sign-in took too long. Please try again.',
          variant: 'destructive',
        });
        popup?.close();
        window.removeEventListener('message', handleCallback);
        setIsConnecting(false);
      }, 2 * 60 * 1000);
    } catch (error) {
      console.error('OAuth initiation error:', error);
      handleOAuthError(error);
    } finally {
      setIsConnecting(false);
    }
  }, [user, hasCredentials, toast]);

  const handleOAuthError = (error: any) => {
    const message = error instanceof Error ? error.message : String(error);

    let title = 'Connection Failed';
    let description = message;

    if (message.includes('deleted_client') || message.includes('invalid_client')) {
      title = 'OAuth Configuration Error';
      description =
        'Your Google OAuth client has been deleted or is invalid. Please recreate your OAuth credentials.';
    } else if (message.includes('invalid_grant')) {
      title = 'Authorization Expired';
      description = 'The authorization code has expired. Please try connecting again.';
    }

    toast({ title, description, variant: 'destructive' });
  };

  const disconnectGmail = useCallback(async () => {
    if (!user) return;

    try {
      await gmailOAuthService.revokeAccess();

      [
        'gmail_credentials_',
        'gmail_tokens_',
        'gmail_connected_',
        'gmail_user_email_',
        'gmail_last_sync_',
        'gmail_processed_emails_',
      ].forEach((key) => localStorage.removeItem(`${key}${user.id}`));

      setIsConnected(false);
      setUserEmail(null);
      setLastSync(null);
      setProcessedEmails([]);

      toast({
        title: 'Gmail Disconnected',
        description: 'Your Gmail account has been disconnected from JobTrail.',
      });
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      toast({
        title: 'Disconnection Failed',
        description: 'Unable to disconnect Gmail. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const syncEmails = useCallback(async () => {
    if (!user || !isConnected) return;

    try {
      const emails = await gmailOAuthService.fetchEmails(50);
      const currentTime = new Date();

      saveProcessedEmails(emails);
      setLastSync(currentTime);
      localStorage.setItem(
        `gmail_last_sync_${user.id}`,
        currentTime.toISOString()
      );

      toast({
        title: 'Emails Synced',
        description: `Found ${emails.length} job-related emails.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes('Authentication expired')) {
        setIsConnected(false);
        localStorage.setItem(`gmail_connected_${user.id}`, 'false');
        toast({
          title: 'Authentication Expired',
          description: 'Please reconnect your Gmail account.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sync Failed',
          description: message,
          variant: 'destructive',
        });
      }
    }
  }, [user, isConnected, toast]);

  const getConnectionStatus = useCallback(() => isConnected, [isConnected]);

  const value: GmailContextType = {
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
    getConnectionStatus,
  };

  return <GmailContext.Provider value={value}>{children}</GmailContext.Provider>;
};

export const useGmail = () => {
  const context = useContext(GmailContext);
  if (!context) {
    throw new Error('useGmail must be used within a GmailProvider');
  }
  return context;
};

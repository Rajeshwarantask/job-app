import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gmailService, ParsedJobEmail } from '@/services/gmailService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GmailContextType {
  isConnected: boolean;
  isConnecting: boolean;
  lastSync: Date | null;
  processedEmails: ParsedJobEmail[];
  connectGmail: () => Promise<void>;
  disconnectGmail: () => Promise<void>;
  syncEmails: () => Promise<void>;
  getConnectionStatus: () => boolean;
}

const GmailContext = createContext<GmailContextType | undefined>(undefined);

export const GmailProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [processedEmails, setProcessedEmails] = useState<ParsedJobEmail[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkGmailConnection();
      loadProcessedEmails();
    }
  }, [user]);

  const checkGmailConnection = () => {
    try {
      const tokens = localStorage.getItem(`gmail_tokens_${user?.id}`);
      const connected = localStorage.getItem(`gmail_connected_${user?.id}`);
      
      if (tokens && connected === 'true') {
        const parsedTokens = JSON.parse(tokens);
        gmailService.setTokens(parsedTokens);
        setIsConnected(true);
        
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
        const emails = JSON.parse(stored);
        setProcessedEmails(emails);
      }
    } catch (error) {
      console.error('Error loading processed emails:', error);
    }
  };

  const saveProcessedEmails = (emails: ParsedJobEmail[]) => {
    try {
      localStorage.setItem(`gmail_processed_emails_${user?.id}`, JSON.stringify(emails));
      setProcessedEmails(emails);
    } catch (error) {
      console.error('Error saving processed emails:', error);
    }
  };

  const connectGmail = async () => {
    if (!user) return;

    setIsConnecting(true);
    try {
      // In a real implementation, this would open a popup window for OAuth
      // For demo purposes, we'll simulate the OAuth flow
      
      // Step 1: Get authorization URL
      const authUrl = gmailService.getAuthUrl();
      console.log('OAuth URL:', authUrl);
      
      // Simulate OAuth flow - in real app, user would be redirected to Google
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate receiving authorization code
      const mockAuthCode = 'mock_auth_code_' + Date.now();
      
      // Step 2: Exchange code for tokens (simulated)
      const mockTokens = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        token_type: 'Bearer',
        expiry_date: Date.now() + 3600000 // 1 hour from now
      };

      // Store tokens securely
      localStorage.setItem(`gmail_tokens_${user.id}`, JSON.stringify(mockTokens));
      localStorage.setItem(`gmail_connected_${user.id}`, 'true');
      
      gmailService.setTokens(mockTokens);
      setIsConnected(true);

      toast({
        title: "Gmail Connected!",
        description: "Your Gmail account has been successfully connected. We'll start monitoring your job-related emails.",
      });

      // Perform initial sync
      await syncEmails();

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
      // Revoke access
      await gmailService.revokeAccess();
      
      // Clear stored data
      localStorage.removeItem(`gmail_tokens_${user.id}`);
      localStorage.removeItem(`gmail_connected_${user.id}`);
      localStorage.removeItem(`gmail_last_sync_${user.id}`);
      localStorage.removeItem(`gmail_processed_emails_${user.id}`);
      
      setIsConnected(false);
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
      // Simulate fetching and processing emails
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock processed emails for demo
      const mockEmails: ParsedJobEmail[] = [
        {
          messageId: 'msg_1',
          company: 'Google',
          subject: 'Thank you for your application - Software Engineer',
          content: 'Thank you for applying to the Software Engineer position at Google...',
          detectedStatus: 'applied',
          confidence: 0.9,
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          sender: 'noreply@google.com'
        },
        {
          messageId: 'msg_2',
          company: 'Microsoft',
          subject: 'Interview Invitation - Product Manager Role',
          content: 'We are pleased to invite you for an interview for the Product Manager position...',
          detectedStatus: 'interview',
          confidence: 0.95,
          timestamp: new Date(Date.now() - 43200000), // 12 hours ago
          sender: 'careers@microsoft.com'
        },
        {
          messageId: 'msg_3',
          company: 'Meta',
          subject: 'Coding Challenge - Frontend Developer',
          content: 'Please complete the following coding challenge for the Frontend Developer role...',
          detectedStatus: 'test',
          confidence: 0.85,
          timestamp: new Date(Date.now() - 21600000), // 6 hours ago
          sender: 'recruiting@meta.com'
        }
      ];

      const currentTime = new Date();
      saveProcessedEmails([...processedEmails, ...mockEmails]);
      setLastSync(currentTime);
      localStorage.setItem(`gmail_last_sync_${user.id}`, currentTime.toISOString());

      toast({
        title: "Emails Synced",
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
    isConnected,
    isConnecting,
    lastSync,
    processedEmails,
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
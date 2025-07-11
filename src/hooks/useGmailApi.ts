import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
  };
}

export interface ParsedMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  gmailUrl: string;
}

export const useGmailApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ParsedMessage[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const getStoredToken = useCallback(() => {
    const tokens = localStorage.getItem(`gmail_tokens_${user?.id}`);
    if (tokens) {
      try {
        const parsed = JSON.parse(tokens);
        return parsed.access_token;
      } catch (error) {
        console.error('Error parsing stored tokens:', error);
        return null;
      }
    }
    return null;
  }, [user?.id]);

  const makeGmailRequest = useCallback(async (url: string) => {
    const token = getStoredToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token expired
      localStorage.removeItem(`gmail_tokens_${user?.id}`);
      localStorage.setItem(`gmail_connected_${user?.id}`, 'false');
      throw new Error('Authentication expired. Please reconnect your Gmail account.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gmail API error: ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }, [getStoredToken, user?.id]);

  const fetchMessages = useCallback(async (maxResults: number = 10) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    try {
      // Fetch message list
      const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
      const listResponse = await makeGmailRequest(listUrl);

      if (!listResponse.messages || listResponse.messages.length === 0) {
        setMessages([]);
        return [];
      }

      // Fetch detailed message data
      const messagePromises = listResponse.messages.map(async (message: { id: string }) => {
        const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`;
        return makeGmailRequest(messageUrl);
      });

      const detailedMessages = await Promise.all(messagePromises);
      const parsedMessages = detailedMessages.map(parseMessage);
      
      setMessages(parsedMessages);
      return parsedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      
      if (errorMessage.includes('Authentication expired')) {
        toast({
          title: "Authentication Expired",
          description: "Please reconnect your Gmail account.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error Fetching Messages",
          description: errorMessage,
          variant: "destructive"
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, makeGmailRequest, toast]);

  const parseMessage = (message: GmailMessage): ParsedMessage => {
    const headers = message.payload.headers;
    
    const getHeader = (name: string) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header?.value || '';
    };

    const from = getHeader('From');
    const to = getHeader('To');
    const subject = getHeader('Subject');
    const date = getHeader('Date');

    // Format date
    const formattedDate = date ? new Date(date).toLocaleString() : new Date(parseInt(message.internalDate)).toLocaleString();

    // Create Gmail URL
    const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${message.id}`;

    return {
      id: message.id,
      threadId: message.threadId,
      from,
      to,
      subject: subject || '(No Subject)',
      date: formattedDate,
      snippet: message.snippet || '',
      gmailUrl
    };
  };

  const isAuthenticated = useCallback(() => {
    const token = getStoredToken();
    const connected = localStorage.getItem(`gmail_connected_${user?.id}`);
    return !!(token && connected === 'true');
  }, [getStoredToken, user?.id]);

  return {
    messages,
    isLoading,
    fetchMessages,
    isAuthenticated,
    makeGmailRequest
  };
};
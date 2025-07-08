// Real Gmail API service for production use
export interface GmailCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

export interface GmailTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface EmailData {
  id: string;
  subject: string;
  sender: string;
  company: string;
  snippet: string;
  date: Date;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'test' | null;
  confidence: number;
  isRead: boolean;
  fullContent?: string;
}

class RealGmailService {
  private credentials: GmailCredentials | null = null;
  private tokens: GmailTokens | null = null;

  // Set OAuth credentials
  setCredentials(credentials: GmailCredentials) {
    this.credentials = {
      ...credentials,
      redirectUri: credentials.redirectUri || `${window.location.origin}/auth/callback`
    };
  }

  // Generate OAuth URL for user authorization
  getAuthUrl(): string {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }

    const params = new URLSearchParams({
      client_id: this.credentials.clientId,
      redirect_uri: this.credentials.redirectUri!,
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<GmailTokens> {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.credentials.redirectUri!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    this.tokens = tokens;
    return tokens;
  }

  // Set tokens (for stored tokens)
  setTokens(tokens: GmailTokens) {
    this.tokens = tokens;
  }

  // Refresh access token
  async refreshTokens(): Promise<GmailTokens> {
    if (!this.credentials || !this.tokens?.refresh_token) {
      throw new Error('Cannot refresh tokens: missing credentials or refresh token');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        refresh_token: this.tokens.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh tokens');
    }

    const newTokens = await response.json();
    this.tokens = { ...this.tokens, ...newTokens };
    return this.tokens;
  }

  // Fetch emails from Gmail API
  async fetchEmails(maxResults: number = 50): Promise<EmailData[]> {
    if (!this.tokens) {
      throw new Error('Not authenticated');
    }

    try {
      // Build search query for job-related emails
      const query = this.buildJobSearchQuery();
      
      // Fetch message list
      const listResponse = await this.makeGmailRequest(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
      );

      if (!listResponse.messages) {
        return [];
      }

      // Fetch full message details
      const emailPromises = listResponse.messages.map(async (message: any) => {
        const fullMessage = await this.makeGmailRequest(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`
        );
        return this.parseEmailMessage(fullMessage);
      });

      const emails = await Promise.all(emailPromises);
      return emails.filter(email => email !== null) as EmailData[];
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  // Make authenticated request to Gmail API
  private async makeGmailRequest(url: string): Promise<any> {
    if (!this.tokens) {
      throw new Error('Not authenticated');
    }

    let response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.tokens.access_token}`,
      },
    });

    // If token expired, try to refresh
    if (response.status === 401 && this.tokens.refresh_token) {
      await this.refreshTokens();
      response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.tokens.access_token}`,
        },
      });
    }

    if (!response.ok) {
      throw new Error(`Gmail API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Build search query for job-related emails
  private buildJobSearchQuery(): string {
    const jobKeywords = [
      'application', 'interview', 'position', 'role', 'job',
      'career', 'opportunity', 'hiring', 'recruitment'
    ];

    const statusKeywords = [
      'thank you for applying', 'application received',
      'shortlisted', 'interview', 'assessment', 'test',
      'offer', 'congratulations', 'unfortunately', 'regret'
    ];

    const senderDomains = [
      'noreply', 'careers', 'jobs', 'hr', 'talent', 'recruiting'
    ];

    const queries = [
      `(${jobKeywords.map(k => `subject:${k}`).join(' OR ')})`,
      `(${statusKeywords.map(k => `"${k}"`).join(' OR ')})`,
      `(${senderDomains.map(d => `from:${d}`).join(' OR ')})`
    ];

    return `(${queries.join(' OR ')}) -is:spam -in:trash`;
  }

  // Parse Gmail message into EmailData format
  private parseEmailMessage(message: any): EmailData | null {
    try {
      const headers = message.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';
      const date = new Date(parseInt(message.internalDate));

      // Extract email body
      const body = this.extractEmailBody(message.payload);
      const content = body.text || body.html || message.snippet;

      // Extract company name
      const company = this.extractCompanyName(from, subject, content);

      // Detect job status
      const statusDetection = this.detectJobStatus(subject, content);

      // Check if message is unread
      const isRead = !message.labelIds?.includes('UNREAD');

      return {
        id: message.id,
        subject,
        sender: from,
        company: company || 'Unknown Company',
        snippet: message.snippet || '',
        date,
        status: statusDetection.status,
        confidence: statusDetection.confidence,
        isRead,
        fullContent: content
      };
    } catch (error) {
      console.error('Error parsing email message:', error);
      return null;
    }
  }

  // Extract email body content
  private extractEmailBody(payload: any): { text?: string; html?: string } {
    let text = '';
    let html = '';

    const extractFromPart = (part: any) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (part.parts) {
        part.parts.forEach(extractFromPart);
      }
    };

    if (payload.parts) {
      payload.parts.forEach(extractFromPart);
    } else if (payload.body?.data) {
      const content = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      if (payload.mimeType === 'text/plain') {
        text = content;
      } else if (payload.mimeType === 'text/html') {
        html = content;
      }
    }

    return { text, html };
  }

  // Extract company name from email
  private extractCompanyName(from: string, subject: string, content: string): string {
    // Extract from sender email domain
    const emailMatch = from.match(/@([^.]+)\./);
    if (emailMatch) {
      const domain = emailMatch[1];
      const commonProviders = ['gmail', 'yahoo', 'outlook', 'hotmail', 'noreply'];
      if (!commonProviders.includes(domain.toLowerCase())) {
        return this.capitalizeCompanyName(domain);
      }
    }

    // Extract from sender name
    const nameMatch = from.match(/^([^<]+)</);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      if (name && !name.includes('@')) {
        return name;
      }
    }

    // Extract from subject or content
    const companyPatterns = [
      /at ([A-Z][a-zA-Z\s&]+)/,
      /from ([A-Z][a-zA-Z\s&]+)/,
      /([A-Z][a-zA-Z\s&]+) team/i
    ];

    for (const pattern of companyPatterns) {
      const match = subject.match(pattern) || content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  // Detect job application status from email content
  private detectJobStatus(subject: string, content: string): { status: EmailData['status']; confidence: number } {
    const text = (subject + ' ' + content).toLowerCase();

    const patterns = {
      applied: [
        { pattern: /thank you for (your )?application/i, confidence: 0.9 },
        { pattern: /application (has been )?received/i, confidence: 0.9 },
        { pattern: /we have received your application/i, confidence: 0.9 }
      ],
      interview: [
        { pattern: /interview/i, confidence: 0.9 },
        { pattern: /shortlisted/i, confidence: 0.8 },
        { pattern: /next (round|step)/i, confidence: 0.7 }
      ],
      test: [
        { pattern: /(coding|technical) (challenge|test|assessment)/i, confidence: 0.9 },
        { pattern: /online (test|assessment)/i, confidence: 0.8 }
      ],
      offer: [
        { pattern: /congratulations/i, confidence: 0.8 },
        { pattern: /(job )?offer/i, confidence: 0.9 },
        { pattern: /welcome to (our )?team/i, confidence: 0.8 }
      ],
      rejected: [
        { pattern: /unfortunately/i, confidence: 0.8 },
        { pattern: /regret to inform/i, confidence: 0.9 },
        { pattern: /not (be )?moving forward/i, confidence: 0.8 }
      ]
    };

    let bestMatch: { status: EmailData['status']; confidence: number } = {
      status: null,
      confidence: 0
    };

    for (const [status, statusPatterns] of Object.entries(patterns)) {
      for (const { pattern, confidence } of statusPatterns) {
        if (pattern.test(text)) {
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              status: status as EmailData['status'],
              confidence
            };
          }
        }
      }
    }

    return bestMatch;
  }

  // Capitalize company name
  private capitalizeCompanyName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  // Revoke access
  async revokeAccess(): Promise<void> {
    if (!this.tokens) {
      return;
    }

    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${this.tokens.access_token}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error revoking access:', error);
    } finally {
      this.tokens = null;
    }
  }

  // Get user info
  async getUserInfo(): Promise<{ email: string; name: string }> {
    if (!this.tokens) {
      throw new Error('Not authenticated');
    }

    const response = await this.makeGmailRequest(
      'https://www.googleapis.com/oauth2/v2/userinfo'
    );

    return {
      email: response.email,
      name: response.name
    };
  }
}

export const realGmailService = new RealGmailService();
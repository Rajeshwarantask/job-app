export interface GmailCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GmailTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<any>;
    mimeType: string;
  };
  internalDate: string;
  labelIds?: string[];
}

export interface ProcessedEmail {
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

class GmailOAuthService {
  private credentials: GmailCredentials | null = null;
  private tokens: GmailTokens | null = null;

  private readonly SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  setCredentials(credentials: GmailCredentials) {
    this.credentials = {
      ...credentials,
      redirectUri: `${window.location.origin}/auth-callback.html`
    };
  }

  getAuthUrl(): string {
    if (!this.credentials) {
      throw new Error('Credentials not set. Please configure OAuth credentials first.');
    }

    const params = new URLSearchParams({
      client_id: this.credentials.clientId,
      redirect_uri: this.credentials.redirectUri,
      scope: this.SCOPES.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: 'gmail_oauth_' + Date.now()
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<GmailTokens> {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }

    console.log('Exchanging code for tokens...', {
      clientId: this.credentials.clientId.substring(0, 20) + '...',
      redirectUri: this.credentials.redirectUri,
      codeLength: code.length
    });

    try {
      const tokenRequestBody = {
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.credentials.redirectUri,
      };

      console.log('Token request body:', {
        ...tokenRequestBody,
        client_secret: '***hidden***',
        code: code.substring(0, 10) + '...'
      });

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenRequestBody),
      });

      console.log('Token exchange response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Token exchange error:', errorData);

        if (errorData.error === 'invalid_client') {
          throw new Error('OAuth client has been deleted or is invalid. Please recreate your OAuth credentials in Google Cloud Console.');
        }
        if (errorData.error === 'deleted_client') {
          throw new Error('OAuth client has been deleted. Please recreate your OAuth credentials in Google Cloud Console.');
        }
        if (errorData.error === 'invalid_grant') {
          throw new Error('Authorization code is invalid or expired. Please try signing in again.');
        }
        if (errorData.error === 'redirect_uri_mismatch') {
          throw new Error('Redirect URI mismatch. Please ensure your Google Cloud Console has the correct redirect URI: ' + this.credentials.redirectUri);
        }
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error || response.statusText}`);
      }

      const tokens = await response.json();
      console.log('Token exchange successful');
      this.tokens = tokens;
      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  setTokens(tokens: GmailTokens) {
    this.tokens = tokens;
  }

  async refreshTokens(): Promise<GmailTokens> {
    if (!this.credentials || !this.tokens?.refresh_token) {
      throw new Error('Cannot refresh tokens: missing credentials or refresh token');
    }

    try {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Token refresh failed: ${errorData.error_description || response.statusText}`);
      }

      const newTokens = await response.json();
      this.tokens = { ...this.tokens, ...newTokens };
      return this.tokens;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw error;
    }
  }

  private async makeGmailRequest(url: string): Promise<any> {
    if (!this.tokens) {
      throw new Error('Not authenticated. Please connect your Gmail account first.');
    }

    let response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.tokens.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401 && this.tokens.refresh_token) {
      try {
        await this.refreshTokens();
        response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.tokens.access_token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (refreshError) {
        throw new Error('Authentication expired. Please reconnect your Gmail account.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gmail API request failed: ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async fetchEmails(maxResults: number = 50): Promise<ProcessedEmail[]> {
    try {
      const query = this.buildJobSearchQuery();
      const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
      const listResponse = await this.makeGmailRequest(listUrl);

      if (!listResponse.messages || listResponse.messages.length === 0) {
        return [];
      }

      const batchSize = 10;
      const emails: ProcessedEmail[] = [];

      for (let i = 0; i < listResponse.messages.length; i += batchSize) {
        const batch = listResponse.messages.slice(i, i + batchSize);
        const batchPromises = batch.map(async (message: any) => {
          try {
            const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`;
            const fullMessage = await this.makeGmailRequest(messageUrl);
            return this.parseEmailMessage(fullMessage);
          } catch (error) {
            console.warn(`Failed to fetch message ${message.id}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        emails.push(...batchResults.filter(email => email !== null) as ProcessedEmail[]);

        if (i + batchSize < listResponse.messages.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  private buildJobSearchQuery(): string {
    const jobKeywords = [
      'application', 'interview', 'position', 'role', 'job',
      'career', 'opportunity', 'hiring', 'recruitment', 'hr'
    ];

    const statusKeywords = [
      'thank you for applying', 'application received', 'application submitted',
      'shortlisted', 'interview', 'assessment', 'test', 'coding challenge',
      'offer', 'congratulations', 'welcome to', 'job offer',
      'unfortunately', 'regret', 'not selected', 'unsuccessful'
    ];

    const senderDomains = [
      'noreply', 'careers', 'jobs', 'hr', 'talent', 'recruiting',
      'workday', 'greenhouse', 'lever', 'bamboohr', 'indeed',
      'linkedin', 'glassdoor', 'monster', 'ziprecruiter'
    ];

    const queries = [
      `(${jobKeywords.map(k => `subject:${k}`).join(' OR ')})`,
      `(${statusKeywords.map(k => `"${k}"`).join(' OR ')})`,
      `(${senderDomains.map(d => `from:${d}`).join(' OR ')})`
    ];

    return `(${queries.join(' OR ')}) -is:spam -in:trash newer_than:6m`;
  }

  private parseEmailMessage(message: GmailMessage): ProcessedEmail | null {
    try {
      const headers = message.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = new Date(parseInt(message.internalDate));

      const body = this.extractEmailBody(message.payload);
      const content = body.text || body.html || message.snippet;

      const company = this.extractCompanyName(from, subject, content);
      const statusDetection = this.detectJobStatus(subject, content);
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

  private extractEmailBody(payload: any): { text?: string; html?: string } {
    let text = '';
    let html = '';

    const extractFromPart = (part: any) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        try {
          text += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } catch (e) {
          console.warn('Failed to decode text part:', e);
        }
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        try {
          html += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } catch (e) {
          console.warn('Failed to decode HTML part:', e);
        }
      } else if (part.parts) {
        part.parts.forEach(extractFromPart);
      }
    };

    if (payload.parts) {
      payload.parts.forEach(extractFromPart);
    } else if (payload.body?.data) {
      try {
        const content = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        if (payload.mimeType === 'text/plain') {
          text = content;
        } else if (payload.mimeType === 'text/html') {
          html = content;
        }
      } catch (e) {
        console.warn('Failed to decode message body:', e);
      }
    }

    return { text, html };
  }

  private extractCompanyName(from: string, subject: string, content: string): string {
    const emailMatch = from.match(/@([^.]+)\./);
    if (emailMatch) {
      const domain = emailMatch[1];
      const commonProviders = ['gmail', 'yahoo', 'outlook', 'hotmail', 'noreply'];
      if (!commonProviders.includes(domain.toLowerCase())) {
        return this.capitalizeCompanyName(domain);
      }
    }

    const nameMatch = from.match(/^([^<]+)</);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      if (name && !name.includes('@')) {
        return name;
      }
    }

    const companyPatterns = [
      /at ([A-Z][a-zA-Z\s&]+)/,
      /from ([A-Z][a-zA-Z\s&]+)/,
      /([A-Z][a-zA-Z\s&]+) team/i,
      /([A-Z][a-zA-Z\s&]+) careers/i
    ];

    for (const pattern of companyPatterns) {
      const match = subject.match(pattern) || content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  private detectJobStatus(subject: string, content: string): { status: ProcessedEmail['status']; confidence: number } {
    const text = (subject + ' ' + content).toLowerCase();

    const patterns = {
      applied: [
        { pattern: /thank you for (your )?application/i, confidence: 0.9 },
        { pattern: /application (has been )?received/i, confidence: 0.9 },
        { pattern: /we have received your application/i, confidence: 0.9 },
        { pattern: /application submitted/i, confidence: 0.8 }
      ],
      interview: [
        { pattern: /interview/i, confidence: 0.9 },
        { pattern: /shortlisted/i, confidence: 0.8 },
        { pattern: /next (round|step)/i, confidence: 0.7 },
        { pattern: /schedule.*(call|meeting)/i, confidence: 0.7 }
      ],
      test: [
        { pattern: /(coding|technical) (challenge|test|assessment)/i, confidence: 0.9 },
        { pattern: /online (test|assessment)/i, confidence: 0.8 },
        { pattern: /complete.*(assignment|task)/i, confidence: 0.7 }
      ],
      offer: [
        { pattern: /congratulations/i, confidence: 0.8 },
        { pattern: /(job )?offer/i, confidence: 0.9 },
        { pattern: /welcome to (our )?team/i, confidence: 0.8 },
        { pattern: /pleased to offer/i, confidence: 0.9 }
      ],
      rejected: [
        { pattern: /unfortunately/i, confidence: 0.8 },
        { pattern: /regret to inform/i, confidence: 0.9 },
        { pattern: /not (be )?moving forward/i, confidence: 0.8 },
        { pattern: /not selected/i, confidence: 0.9 },
        { pattern: /unsuccessful/i, confidence: 0.8 }
      ]
    };

    let bestMatch: { status: ProcessedEmail['status']; confidence: number } = {
      status: null,
      confidence: 0
    };

    for (const [status, statusPatterns] of Object.entries(patterns)) {
      for (const { pattern, confidence } of statusPatterns) {
        if (pattern.test(text)) {
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              status: status as ProcessedEmail['status'],
              confidence
            };
          }
        }
      }
    }

    return bestMatch;
  }

  private capitalizeCompanyName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  async getUserInfo(): Promise<{ email: string; name: string }> {
    try {
      const response = await this.makeGmailRequest(
        'https://www.googleapis.com/oauth2/v2/userinfo'
      );

      return {
        email: response.email,
        name: response.name || response.email.split('@')[0]
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

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

  isAuthenticated(): boolean {
    return !!(this.tokens && this.tokens.access_token);
  }

  getTokens(): GmailTokens | null {
    return this.tokens;
  }
}

export const gmailOAuthService = new GmailOAuthService();

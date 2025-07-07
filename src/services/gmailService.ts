import { google } from 'googleapis';

export interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: any;
  internalDate: string;
}

export interface ParsedJobEmail {
  messageId: string;
  company: string;
  subject: string;
  content: string;
  detectedStatus: 'applied' | 'interview' | 'offer' | 'rejected' | 'test' | null;
  confidence: number;
  timestamp: Date;
  sender: string;
}

class GmailService {
  private oauth2Client: any;
  private gmail: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.VITE_GOOGLE_CLIENT_ID,
      process.env.VITE_GOOGLE_CLIENT_SECRET,
      process.env.VITE_GOOGLE_REDIRECT_URI
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  // Initialize OAuth flow
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  // Set stored tokens
  setTokens(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Refresh access token
  async refreshTokens() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      return credentials;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  // Fetch job-related emails
  async fetchJobEmails(lastProcessedDate?: Date): Promise<EmailMessage[]> {
    try {
      let query = this.buildJobSearchQuery();
      
      if (lastProcessedDate) {
        const dateStr = Math.floor(lastProcessedDate.getTime() / 1000);
        query += ` after:${dateStr}`;
      }

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50
      });

      if (!response.data.messages) {
        return [];
      }

      const messages = await Promise.all(
        response.data.messages.map(async (message: any) => {
          const fullMessage = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });
          return fullMessage.data;
        })
      );

      return messages;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails from Gmail');
    }
  }

  // Build search query for job-related emails
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

    return `(${queries.join(' OR ')}) -is:spam -in:trash`;
  }

  // Parse email content to detect job status
  parseJobEmail(message: EmailMessage): ParsedJobEmail | null {
    try {
      const headers = message.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';
      const date = new Date(parseInt(message.internalDate));

      // Extract email body
      const body = this.extractEmailBody(message.payload);
      const content = body.text || body.html || message.snippet;

      // Detect company name
      const company = this.extractCompanyName(from, subject, content);

      // Detect job status
      const statusDetection = this.detectJobStatus(subject, content);

      if (!statusDetection.status && !company) {
        return null; // Not a job-related email
      }

      return {
        messageId: message.id,
        company: company || 'Unknown Company',
        subject,
        content,
        detectedStatus: statusDetection.status,
        confidence: statusDetection.confidence,
        timestamp: date,
        sender: from
      };
    } catch (error) {
      console.error('Error parsing email:', error);
      return null;
    }
  }

  // Extract email body content
  private extractEmailBody(payload: any): { text?: string; html?: string } {
    let text = '';
    let html = '';

    const extractFromPart = (part: any) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.parts) {
        part.parts.forEach(extractFromPart);
      }
    };

    if (payload.parts) {
      payload.parts.forEach(extractFromPart);
    } else if (payload.body?.data) {
      if (payload.mimeType === 'text/plain') {
        text = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      } else if (payload.mimeType === 'text/html') {
        html = Buffer.from(payload.body.data, 'base64').toString('utf-8');
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
      // Skip common email providers
      const commonProviders = ['gmail', 'yahoo', 'outlook', 'hotmail', 'noreply', 'workday'];
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

  // Detect job application status from email content
  private detectJobStatus(subject: string, content: string): { status: ParsedJobEmail['detectedStatus']; confidence: number } {
    const text = (subject + ' ' + content).toLowerCase();

    const patterns = {
      applied: [
        { pattern: /thank you for (your )?application/i, confidence: 0.9 },
        { pattern: /application (has been )?received/i, confidence: 0.9 },
        { pattern: /we have received your application/i, confidence: 0.9 },
        { pattern: /application submitted/i, confidence: 0.8 },
        { pattern: /thanks for applying/i, confidence: 0.8 }
      ],
      interview: [
        { pattern: /interview/i, confidence: 0.9 },
        { pattern: /shortlisted/i, confidence: 0.8 },
        { pattern: /next (round|step)/i, confidence: 0.7 },
        { pattern: /schedule.*(call|meeting)/i, confidence: 0.7 },
        { pattern: /phone (screen|call)/i, confidence: 0.8 }
      ],
      test: [
        { pattern: /(coding|technical) (challenge|test|assessment)/i, confidence: 0.9 },
        { pattern: /online (test|assessment)/i, confidence: 0.8 },
        { pattern: /complete.*(assignment|task)/i, confidence: 0.7 },
        { pattern: /take.*(test|quiz)/i, confidence: 0.7 }
      ],
      offer: [
        { pattern: /congratulations/i, confidence: 0.8 },
        { pattern: /(job )?offer/i, confidence: 0.9 },
        { pattern: /welcome to (our )?team/i, confidence: 0.8 },
        { pattern: /pleased to offer/i, confidence: 0.9 },
        { pattern: /extend.*(offer|invitation)/i, confidence: 0.8 }
      ],
      rejected: [
        { pattern: /unfortunately/i, confidence: 0.8 },
        { pattern: /regret to inform/i, confidence: 0.9 },
        { pattern: /not (be )?moving forward/i, confidence: 0.8 },
        { pattern: /not selected/i, confidence: 0.9 },
        { pattern: /unsuccessful/i, confidence: 0.8 },
        { pattern: /decided to go with/i, confidence: 0.7 }
      ]
    };

    let bestMatch: { status: ParsedJobEmail['detectedStatus']; confidence: number } = {
      status: null,
      confidence: 0
    };

    for (const [status, statusPatterns] of Object.entries(patterns)) {
      for (const { pattern, confidence } of statusPatterns) {
        if (pattern.test(text)) {
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              status: status as ParsedJobEmail['detectedStatus'],
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

  // Revoke Gmail access
  async revokeAccess() {
    try {
      await this.oauth2Client.revokeCredentials();
    } catch (error) {
      console.error('Error revoking access:', error);
      throw new Error('Failed to revoke Gmail access');
    }
  }
}

export const gmailService = new GmailService();
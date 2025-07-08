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

// Mock OAuth2 client for frontend simulation
class MockOAuth2Client {
  private credentials: any = null;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    // Mock constructor - store config if needed
  }

  generateAuthUrl(options: any): string {
    // Return a mock auth URL for simulation
    return `https://accounts.google.com/oauth/authorize?client_id=mock&redirect_uri=${encodeURIComponent(options.redirect_uri || '')}&scope=${encodeURIComponent(options.scope?.join(' ') || '')}&response_type=code&access_type=${options.access_type || 'online'}`;
  }

  async getToken(code: string) {
    // Mock token exchange
    const mockTokens = {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      token_type: 'Bearer',
      expiry_date: Date.now() + 3600000
    };
    
    this.credentials = mockTokens;
    return { tokens: mockTokens };
  }

  setCredentials(tokens: any) {
    this.credentials = tokens;
  }

  async refreshAccessToken() {
    // Mock token refresh
    const mockCredentials = {
      access_token: 'mock_refreshed_access_token_' + Date.now(),
      refresh_token: this.credentials?.refresh_token || 'mock_refresh_token',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      token_type: 'Bearer',
      expiry_date: Date.now() + 3600000
    };
    
    this.credentials = mockCredentials;
    return { credentials: mockCredentials };
  }

  async revokeCredentials() {
    // Mock revoke
    this.credentials = null;
  }
}

// Mock Gmail API client for frontend simulation
class MockGmailClient {
  constructor(config: any) {
    // Mock constructor
  }

  users = {
    messages: {
      list: async (params: any) => {
        // Mock message list response
        const mockMessages = this.generateMockMessages(params.maxResults || 10);
        return {
          data: {
            messages: mockMessages.map(msg => ({ id: msg.id }))
          }
        };
      },
      get: async (params: any) => {
        // Mock individual message response
        const mockMessage = this.generateMockMessage(params.id);
        return { data: mockMessage };
      }
    }
  };

  private generateMockMessages(count: number): EmailMessage[] {
    const mockMessages: EmailMessage[] = [];
    const companies = ['TechCorp', 'StartupXYZ', 'BigTech Inc', 'InnovateCo', 'DevCompany'];
    const statuses = ['applied', 'interview', 'offer', 'rejected', 'test'];
    
    for (let i = 0; i < count; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const id = `mock_message_${i}_${Date.now()}`;
      
      mockMessages.push({
        id,
        threadId: `thread_${i}`,
        snippet: this.generateMockSnippet(status, company),
        payload: this.generateMockPayload(status, company, id),
        internalDate: (Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toString()
      });
    }
    
    return mockMessages;
  }

  private generateMockMessage(id: string): EmailMessage {
    const companies = ['TechCorp', 'StartupXYZ', 'BigTech Inc', 'InnovateCo', 'DevCompany'];
    const statuses = ['applied', 'interview', 'offer', 'rejected', 'test'];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id,
      threadId: `thread_${id}`,
      snippet: this.generateMockSnippet(status, company),
      payload: this.generateMockPayload(status, company, id),
      internalDate: (Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toString()
    };
  }

  private generateMockSnippet(status: string, company: string): string {
    const snippets = {
      applied: `Thank you for your application to ${company}. We have received your application and will review it shortly.`,
      interview: `Congratulations! We would like to invite you for an interview at ${company}. Please let us know your availability.`,
      offer: `We are pleased to extend a job offer from ${company}. Congratulations on your successful application!`,
      rejected: `Thank you for your interest in ${company}. Unfortunately, we have decided to move forward with other candidates.`,
      test: `Please complete this coding challenge for your application to ${company}. You have 48 hours to submit your solution.`
    };
    
    return snippets[status as keyof typeof snippets] || `Update regarding your application to ${company}.`;
  }

  private generateMockPayload(status: string, company: string, messageId: string): any {
    const subjects = {
      applied: `Application Received - ${company}`,
      interview: `Interview Invitation - ${company}`,
      offer: `Job Offer - ${company}`,
      rejected: `Application Update - ${company}`,
      test: `Coding Challenge - ${company}`
    };

    const bodies = {
      applied: `Dear Candidate,\n\nThank you for your application to the Software Engineer position at ${company}. We have received your application and our team will review it carefully.\n\nWe will be in touch within the next few days.\n\nBest regards,\n${company} HR Team`,
      interview: `Dear Candidate,\n\nCongratulations! We were impressed with your application and would like to invite you for an interview.\n\nPlease reply with your availability for next week.\n\nBest regards,\n${company} Hiring Team`,
      offer: `Dear Candidate,\n\nWe are delighted to extend an offer for the Software Engineer position at ${company}.\n\nPlease review the attached offer letter and let us know your decision.\n\nCongratulations!\n\n${company} HR Team`,
      rejected: `Dear Candidate,\n\nThank you for your interest in ${company} and for taking the time to apply.\n\nAfter careful consideration, we have decided to move forward with other candidates.\n\nWe wish you the best in your job search.\n\n${company} HR Team`,
      test: `Dear Candidate,\n\nAs the next step in our interview process, please complete the attached coding challenge.\n\nYou have 48 hours to submit your solution.\n\nGood luck!\n\n${company} Engineering Team`
    };

    const subject = subjects[status as keyof typeof subjects] || `Update from ${company}`;
    const body = bodies[status as keyof typeof bodies] || `Update regarding your application to ${company}.`;
    const encodedBody = Buffer.from(body).toString('base64');

    return {
      headers: [
        { name: 'Subject', value: subject },
        { name: 'From', value: `noreply@${company.toLowerCase().replace(/\s+/g, '')}.com` },
        { name: 'To', value: 'candidate@example.com' },
        { name: 'Date', value: new Date().toUTCString() }
      ],
      body: {
        data: encodedBody
      },
      mimeType: 'text/plain'
    };
  }
}

class GmailService {
  private oauth2Client: MockOAuth2Client;
  private gmail: MockGmailClient;

  constructor() {
    this.oauth2Client = new MockOAuth2Client(
      import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
      import.meta.env.VITE_GOOGLE_REDIRECT_URI || ''
    );

    this.gmail = new MockGmailClient({ version: 'v1', auth: this.oauth2Client });
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
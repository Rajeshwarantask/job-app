export interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: GmailPayload;
  internalDate: string;
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailBody {
  data?: string;
}

export interface GmailPart {
  mimeType?: string;
  body?: GmailBody;
  parts?: GmailPart[];
  headers?: GmailHeader[];
}

export interface GmailPayload {
  mimeType?: string;
  headers: GmailHeader[];
  body?: GmailBody;
  parts?: GmailPart[];
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

interface OAuth2Options {
  access_type?: string;
  scope?: string[];
  prompt?: string;
  redirect_uri?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

interface MessageListParams {
  userId: string;
  q?: string;
  maxResults?: number;
}

interface MessageGetParams {
  userId: string;
  id: string;
  format: string;
}

interface MessageListResponse {
  data: {
    messages?: { id: string }[];
  };
}

interface MessageGetResponse {
  data: EmailMessage;
}

class MockOAuth2Client {
  private credentials: TokenResponse | null = null;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {}

  generateAuthUrl(options: OAuth2Options): string {
    return `https://accounts.google.com/oauth/authorize?client_id=mock&redirect_uri=${encodeURIComponent(
      options.redirect_uri || ''
    )}&scope=${encodeURIComponent(options.scope?.join(' ') || '')}&response_type=code&access_type=${options.access_type || 'online'}`;
  }

  async getToken(code: string): Promise<{ tokens: TokenResponse }> {
    const mockTokens: TokenResponse = {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      token_type: 'Bearer',
      expiry_date: Date.now() + 3600000
    };

    this.credentials = mockTokens;
    return { tokens: mockTokens };
  }

  setCredentials(tokens: TokenResponse): void {
    this.credentials = tokens;
  }

  async refreshAccessToken(): Promise<{ credentials: TokenResponse }> {
    const refreshed: TokenResponse = {
      access_token: 'mock_refreshed_access_token_' + Date.now(),
      refresh_token: this.credentials?.refresh_token || 'mock_refresh_token',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      token_type: 'Bearer',
      expiry_date: Date.now() + 3600000
    };
    this.credentials = refreshed;
    return { credentials: refreshed };
  }

  async revokeCredentials(): Promise<void> {
    this.credentials = null;
  }
}

class MockGmailClient {
  constructor(config: { version: string; auth: MockOAuth2Client }) {}

  users = {
    messages: {
      list: async (params: MessageListParams): Promise<MessageListResponse> => {
        const messages = this.generateMockMessages(params.maxResults || 10);
        return {
          data: {
            messages: messages.map((msg) => ({ id: msg.id }))
          }
        };
      },
      get: async (params: MessageGetParams): Promise<MessageGetResponse> => {
        const message = this.generateMockMessage(params.id);
        return { data: message };
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
    const snippets: Record<string, string> = {
      applied: `Thank you for your application to ${company}.`,
      interview: `Interview at ${company}. Let us know your availability.`,
      offer: `Job offer from ${company}. Congratulations!`,
      rejected: `Thank you for applying to ${company}.`,
      test: `Complete this coding test for ${company}.`
    };
    return snippets[status] || `Update from ${company}.`;
  }

  private generateMockPayload(status: string, company: string, messageId: string): GmailPayload {
    const subjects: Record<string, string> = {
      applied: `Application Received - ${company}`,
      interview: `Interview Invitation - ${company}`,
      offer: `Job Offer - ${company}`,
      rejected: `Application Update - ${company}`,
      test: `Coding Challenge - ${company}`
    };

    const bodies: Record<string, string> = {
      applied: `Thank you for applying to ${company}.`,
      interview: `You are invited for an interview at ${company}.`,
      offer: `We are offering you a role at ${company}.`,
      rejected: `You were not selected for ${company}.`,
      test: `Please complete the test for ${company}.`
    };

    const subject = subjects[status] || `Update from ${company}`;
    const body = Buffer.from(bodies[status] || '').toString('base64');

    return {
      headers: [
        { name: 'Subject', value: subject },
        { name: 'From', value: `noreply@${company.toLowerCase().replace(/\s+/g, '')}.com` },
        { name: 'To', value: 'candidate@example.com' },
        { name: 'Date', value: new Date().toUTCString() }
      ],
      body: {
        data: body
      },
      mimeType: 'text/plain'
    };
  }
}


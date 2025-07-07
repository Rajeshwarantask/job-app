# JobTrail - Smart Job Application Tracker with Gmail Integration

JobTrail is a comprehensive job application tracking system that automatically monitors your Gmail for job-related emails and intelligently updates your application statuses.

## 🚀 Features

### 📧 Gmail Integration
- **Secure OAuth 2.0 Authentication**: Connect your Gmail account safely
- **Smart Email Detection**: AI-powered parsing of job-related emails
- **Automatic Status Updates**: Detect application confirmations, interview invitations, offers, and rejections
- **Privacy-First**: Read-only access with encrypted token storage

### 📊 Job Tracking
- **Visual Kanban Board**: Organize applications by status
- **Detailed Analytics**: Track your application performance
- **Timeline View**: See the progression of each application
- **Manual Entry**: Add applications not detected via email

### 🔐 Security & Privacy
- **End-to-End Encryption**: All sensitive data is encrypted
- **No Email Storage**: Only extract status information, not full content
- **Revokable Access**: Disconnect Gmail integration anytime
- **HTTPS Only**: Secure communication throughout

## 🛠️ Technical Implementation

### Gmail API Integration
```typescript
// OAuth 2.0 Flow
const authUrl = gmailService.getAuthUrl();
const tokens = await gmailService.getTokens(authCode);

// Email Fetching with Smart Queries
const emails = await gmailService.fetchJobEmails();
const parsed = emails.map(email => gmailService.parseJobEmail(email));
```

### Smart Email Parsing
- **Keyword Detection**: Identifies job-related content using NLP patterns
- **Company Extraction**: Automatically detects company names from senders
- **Status Classification**: Categorizes emails into application stages
- **Confidence Scoring**: Provides accuracy metrics for each detection

### Background Synchronization
- **Scheduled Jobs**: Automatic email checking every few hours
- **Incremental Sync**: Only processes new emails since last check
- **Error Handling**: Robust retry mechanisms and logging

## 📋 Setup Instructions

### 1. Google Cloud Configuration
1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Gmail API
3. Create OAuth 2.0 credentials
4. Configure the OAuth consent screen

### 2. Environment Variables
```bash
cp .env.example .env
```

Fill in your Google OAuth credentials:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

### 3. Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Gmail API Scopes

The application requests these minimal scopes:
- `https://www.googleapis.com/auth/gmail.readonly` - Read-only email access
- `https://www.googleapis.com/auth/userinfo.email` - User email address
- `https://www.googleapis.com/auth/userinfo.profile` - Basic profile info

## 📊 Email Detection Patterns

### Application Confirmations
- "Thank you for your application"
- "Application received"
- "We have received your application"

### Interview Invitations
- "Interview invitation"
- "You have been shortlisted"
- "Schedule a call"

### Test/Assessment Requests
- "Coding challenge"
- "Technical assessment"
- "Online test"

### Job Offers
- "Congratulations"
- "Job offer"
- "Welcome to our team"

### Rejections
- "Unfortunately"
- "Regret to inform"
- "Not moving forward"

## 🔒 Security Measures

### Data Protection
- **Token Encryption**: OAuth tokens encrypted before storage
- **Local Storage**: Sensitive data stored locally, not on servers
- **No Email Persistence**: Email content is processed but not stored
- **Secure Communication**: All API calls use HTTPS

### Privacy Compliance
- **Minimal Data Collection**: Only job-related metadata extracted
- **User Control**: Full control over data and access permissions
- **Transparent Processing**: Clear indication of what data is used
- **Easy Revocation**: One-click disconnect and data deletion

## 🚀 Production Deployment

### Google OAuth Verification
For production use with more than 100 users:
1. Submit your app for OAuth verification
2. Provide privacy policy and terms of service
3. Complete security assessment
4. Demonstrate secure data handling

### Scaling Considerations
- **Rate Limiting**: Respect Gmail API quotas
- **Caching**: Implement Redis for processed email IDs
- **Background Jobs**: Use queue systems for email processing
- **Monitoring**: Implement comprehensive logging and alerting

## 📈 Analytics & Insights

The system provides detailed analytics:
- **Response Rates**: Track how often you hear back from applications
- **Platform Performance**: Compare success rates across job boards
- **Timeline Analysis**: Understand typical hiring timelines
- **Status Progression**: Visualize your application funnel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the FAQ section

---

**Note**: This implementation includes simulated Gmail integration for demonstration purposes. In production, you would need to implement actual Gmail API calls and proper OAuth flow.
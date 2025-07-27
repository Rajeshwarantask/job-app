# JobTrail - Smart Job Application Tracker with Gmail Integration

JobTrail is a comprehensive job application tracking system that automatically monitors your Gmail for job-related emails and intelligently updates your application statuses.

## Link : https://job-app-r5ah.onrender.com

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

<img width="1000" height="869" alt="Screenshot 2025-07-18 190338" src="https://github.com/user-attachments/assets/5b80412f-6ff6-42ae-b806-e1683573226a" />
<img width="999" height="869" alt="Screenshot 2025-07-18 190217" src="https://github.com/user-attachments/assets/81bd274d-a2db-49b2-bd80-0645737be602" />
<img width="1900" height="870" alt="Screenshot 2025-07-18 190059" src="https://github.com/user-attachments/assets/50e69f95-61b2-432c-9f4f-4fd8de8ceb64" />



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
Fill in your Google OAuth credentials:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
VITE_GOOGLE_REDIRECT_URI=http://https:site/auth/callback
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

| Category                 | Phrases                                                                 |
|--------------------------|-------------------------------------------------------------------------|
| **Application Confirmations** | "Thank you for your application"<br>"Application received"<br>"We have received your application" |
| **Interview Invitations**     | "Interview invitation"<br>"You have been shortlisted"<br>"Schedule a call" |
| **Test/Assessment Requests**  | "Coding challenge"<br>"Technical assessment"<br>"Online test"         |
| **Job Offers**                | "Congratulations"<br>"Job offer"<br>"Welcome to our team"             |
| **Rejections**                | "Unfortunately"<br>"Regret to inform"<br>"Not moving forward"         |


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

## 📈 Analytics & Insights

The system provides detailed analytics:
- **Response Rates**: Track how often you hear back from applications
- **Platform Performance**: Compare success rates across job boards
- **Timeline Analysis**: Understand typical hiring timelines
- **Status Progression**: Visualize your application funnel


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

- Check the documentation
- Review the FAQ section

---

**Note**: This implementation includes simulated Gmail integration for demonstration purposes. In production, you would need to implement actual Gmail API calls and proper OAuth flow.

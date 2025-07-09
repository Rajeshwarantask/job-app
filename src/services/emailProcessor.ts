import { ProcessedEmail } from './gmailOAuthService';
import { Job } from '@/types/Job';

export interface EmailJobMatch {
  email: ProcessedEmail;
  matchedJob: Job | null;
  confidence: number;
  suggestedAction: 'update_status' | 'create_job' | 'ignore';
}

class EmailProcessor {
  // Process emails and match them with existing jobs
  processEmails(emails: ProcessedEmail[], existingJobs: Job[]): EmailJobMatch[] {
    return emails.map(email => this.matchEmailToJob(email, existingJobs));
  }

  // Match a single email to existing jobs
  private matchEmailToJob(email: ProcessedEmail, jobs: Job[]): EmailJobMatch {
    let bestMatch: Job | null = null;
    let bestScore = 0;

    for (const job of jobs) {
      const score = this.calculateMatchScore(email, job);
      if (score > bestScore && score > 0.6) { // Minimum confidence threshold
        bestScore = score;
        bestMatch = job;
      }
    }

    return {
      email,
      matchedJob: bestMatch,
      confidence: bestScore,
      suggestedAction: this.determineSuggestedAction(email, bestMatch, bestScore)
    };
  }

  // Calculate how well an email matches a job
  private calculateMatchScore(email: ProcessedEmail, job: Job): number {
    let score = 0;
    let factors = 0;

    // Company name matching (most important factor)
    const companyScore = this.compareStrings(email.company, job.company);
    score += companyScore * 0.4;
    factors += 0.4;

    // Role/position matching
    const roleScore = this.findRoleInText(job.role, email.subject + ' ' + (email.fullContent || ''));
    score += roleScore * 0.3;
    factors += 0.3;

    // Date proximity (emails should be after application date)
    const dateScore = this.calculateDateScore(email.date, new Date(job.applicationDate));
    score += dateScore * 0.2;
    factors += 0.2;

    // Status progression logic
    const statusScore = this.calculateStatusScore(email.status, job.status);
    score += statusScore * 0.1;
    factors += 0.1;

    return factors > 0 ? score / factors : 0;
  }

  // Compare two strings for similarity
  private compareStrings(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;

    // Check if one contains the other
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Simple word matching
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    
    let matchingWords = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.length > 2 && word2.length > 2 && word1 === word2) {
          matchingWords++;
          break;
        }
      }
    }

    const totalWords = Math.max(words1.length, words2.length);
    return totalWords > 0 ? matchingWords / totalWords : 0;
  }

  // Find role keywords in text
  private findRoleInText(role: string, text: string): number {
    if (!role || !text) return 0;

    const roleWords = role.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();

    let foundWords = 0;
    for (const word of roleWords) {
      if (word.length > 2 && textLower.includes(word)) {
        foundWords++;
      }
    }

    return roleWords.length > 0 ? foundWords / roleWords.length : 0;
  }

  // Calculate score based on date proximity
  private calculateDateScore(emailDate: Date, applicationDate: Date): number {
    // Defensive check for undefined or null dates
    if (!emailDate || !applicationDate) return 0;
    
    const diffMs = emailDate.getTime() - applicationDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Email should be after application date
    if (diffDays < 0) return 0;

    // Best score for emails within 30 days of application
    if (diffDays <= 30) return 1;

    // Decreasing score for older emails
    if (diffDays <= 90) return 0.7;
    if (diffDays <= 180) return 0.4;

    return 0.1;
  }

  // Calculate score based on status progression
  private calculateStatusScore(emailStatus: ProcessedEmail['status'], jobStatus: string): number {
    if (!emailStatus) return 0.5;

    const statusProgression = {
      'applied': 1,
      'test': 2,
      'interview': 3,
      'offer': 4,
      'rejected': 5
    };

    const emailLevel = statusProgression[emailStatus as keyof typeof statusProgression] || 0;
    const jobLevel = statusProgression[jobStatus as keyof typeof statusProgression] || 0;

    // Email status should be same or higher than current job status
    if (emailLevel >= jobLevel) return 1;
    if (emailLevel === jobLevel - 1) return 0.7;

    return 0.3;
  }

  // Determine what action should be taken
  private determineSuggestedAction(
    email: ProcessedEmail, 
    matchedJob: Job | null, 
    confidence: number
  ): 'update_status' | 'create_job' | 'ignore' {
    if (!email.status) return 'ignore';

    if (matchedJob && confidence > 0.7) {
      // High confidence match - suggest status update
      return 'update_status';
    }

    if (!matchedJob && email.status === 'applied' && confidence < 0.3) {
      // No match and it's an application confirmation - suggest creating new job
      return 'create_job';
    }

    return 'ignore';
  }

  // Generate a new job from email data
  generateJobFromEmail(email: ProcessedEmail): Omit<Job, 'id'> {
    return {
      company: email.company,
      role: this.extractRoleFromEmail(email),
      platform: this.extractPlatformFromEmail(email),
      applicationDate: email.date.toISOString().split('T')[0],
      status: email.status || 'applied',
      notes: `Auto-detected from email: ${email.subject}`,
      url: undefined,
      testDate: undefined,
      interviewDate: undefined
    };
  }

  // Extract role from email content
  private extractRoleFromEmail(email: ProcessedEmail): string {
    const subject = email.subject;
    
    // Common patterns for role extraction
    const patterns = [
      /for the (.+?) position/i,
      /for the (.+?) role/i,
      /(.+?) position at/i,
      /(.+?) role at/i,
      /application.+?for (.+?) at/i,
      /(.+?) - .+/i // Role - Company pattern
    ];

    for (const pattern of patterns) {
      const match = subject.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback: use company name + "Position"
    return `Position at ${email.company}`;
  }

  // Extract platform from email sender
  private extractPlatformFromEmail(email: ProcessedEmail): string {
    const sender = email.sender.toLowerCase();

    if (sender.includes('linkedin')) return 'LinkedIn';
    if (sender.includes('indeed')) return 'Indeed';
    if (sender.includes('glassdoor')) return 'Glassdoor';
    if (sender.includes('monster')) return 'Monster';
    if (sender.includes('ziprecruiter')) return 'ZipRecruiter';
    if (sender.includes('workday')) return 'Workday';
    if (sender.includes('greenhouse')) return 'Greenhouse';
    if (sender.includes('lever')) return 'Lever';

    return 'Company Website';
  }
}

export const emailProcessor = new EmailProcessor();
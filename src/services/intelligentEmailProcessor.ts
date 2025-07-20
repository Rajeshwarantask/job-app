import { ProcessedEmail } from './gmailOAuthService';
import { Job } from '@/types/Job';
import { nlpService, EmailClassification, JobStage, TimelineConfidence } from './nlpService';

export interface IntelligentEmailMatch {
  email: ProcessedEmail;
  classification: EmailClassification;
  matchedJob: Job | null;
  confidence: number;
  suggestedAction: 'update_status' | 'create_job' | 'add_to_timeline' | 'ignore';
  timelineConfidence?: TimelineConfidence;
  followUpSuggestions?: Array<{
    type: 'follow_up' | 'thank_you' | 'status_inquiry';
    message: string;
    urgency: 'low' | 'medium' | 'high';
  }>;
}

export interface JobTimeline {
  jobId: string;
  stages: Array<{
    stage: JobStage;
    date: Date;
    emailId?: string;
    confidence: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    notes?: string;
  }>;
  currentStage: JobStage;
  confidence: TimelineConfidence;
  predictions: Array<{
    stage: JobStage;
    probability: number;
    timeframe: string;
  }>;
}

class IntelligentEmailProcessor {
  // Process emails with advanced NLP classification
  processEmailsIntelligently(emails: ProcessedEmail[], existingJobs: Job[]): IntelligentEmailMatch[] {
    return emails.map(email => this.analyzeEmailIntelligently(email, existingJobs, emails));
  }

  // Analyze single email with full intelligence
  private analyzeEmailIntelligently(email: ProcessedEmail, jobs: Job[], allEmails: ProcessedEmail[]): IntelligentEmailMatch {
    const classification = nlpService.classifyEmail(email.subject, email.fullContent || email.snippet);
    const matchResult = this.findBestJobMatch(email, classification, jobs);

    return {
      email,
      classification,
      matchedJob: matchResult.job,
      confidence: matchResult.confidence,
      suggestedAction: this.determineSuggestedAction(classification, matchResult.job, matchResult.confidence),
    };
  }

  // Enhanced job matching with NLP insights
  private findBestJobMatch(email: ProcessedEmail, classification: EmailClassification, jobs: Job[]): { job: Job | null; confidence: number } {
    let bestMatch: Job | null = null;
    let bestScore = 0;

    for (const job of jobs) {
      let score = 0;
      let factors = 0;

      const companyScore = this.compareCompanyNames(classification.entities.company || email.company, job.company);
      score += companyScore * 0.3;
      factors += 0.3;

      const positionScore = this.comparePositions(classification.entities.position || '', job.role);
      score += positionScore * 0.25;
      factors += 0.25;

      const finalScore = factors > 0 ? score / factors : 0;

      if (finalScore > bestScore && finalScore > 0.6) {
        bestScore = finalScore;
        bestMatch = job;
      }
    }

    return { job: bestMatch, confidence: bestScore };
  }

  private compareCompanyNames(emailCompany: string, jobCompany: string): number {
    if (!emailCompany || !jobCompany) return 0;

    const normalize = (name: string) => name.toLowerCase().replace(/\b(inc|ltd|llc|corp|corporation|company|co)\b/g, '').replace(/[^\w\s]/g, '').trim();
    const email = normalize(emailCompany);
    const job = normalize(jobCompany);

    if (email === job) return 1;
    if (email.includes(job) || job.includes(email)) return 0.9;

    return 0;
  }

  private comparePositions(emailPosition: string, jobPosition: string): number {
    if (!emailPosition || !jobPosition) return 0.5;

    const normalize = (pos: string) => pos.toLowerCase().replace(/\b(senior|junior|sr|jr|lead|principal)\b/g, '').trim();
    const email = normalize(emailPosition);
    const job = normalize(jobPosition);

    if (email === job) return 1;
    if (email.includes(job) || job.includes(email)) return 0.8;

    return 0;
  }

  private determineSuggestedAction(classification: EmailClassification, matchedJob: Job | null, confidence: number): IntelligentEmailMatch['suggestedAction'] {
    if (confidence < 0.4) return 'ignore';
    if (matchedJob && confidence > 0.7) return 'add_to_timeline';
    if (matchedJob && confidence > 0.5) return 'update_status';
    if (!matchedJob && classification.stage === 'application_received' && confidence > 0.6) return 'create_job';
    return 'ignore';
  }
}

export const intelligentEmailProcessor = new IntelligentEmailProcessor();
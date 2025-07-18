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
    // Classify email using NLP
    const classification = nlpService.classifyEmail(email.subject, email.fullContent || email.snippet);
    
    // Find best matching job
    const matchResult = this.findBestJobMatch(email, classification, jobs);
    
    // Generate timeline confidence if job matched
    let timelineConfidence: TimelineConfidence | undefined;
    let followUpSuggestions: IntelligentEmailMatch['followUpSuggestions'];
    
    if (matchResult.job) {
      // Get all emails for this job to build timeline confidence
      const jobEmails = this.getJobEmails(matchResult.job.id, allEmails);
      timelineConfidence = nlpService.generateTimelineConfidence(
        jobEmails.map(e => ({ 
          classification: nlpService.classifyEmail(e.subject, e.fullContent || e.snippet), 
          date: e.date 
        })),
        classification.stage
      );
      
      // Generate follow-up suggestions
      followUpSuggestions = nlpService.generateFollowUpSuggestions(
        email.date,
        classification.stage,
        classification.sentiment
      );
    }

    return {
      email,
      classification,
      matchedJob: matchResult.job,
      confidence: matchResult.confidence,
      suggestedAction: this.determineSuggestedAction(classification, matchResult.job, matchResult.confidence),
      timelineConfidence,
      followUpSuggestions
    };
  }

  // Enhanced job matching with NLP insights
  private findBestJobMatch(
    email: ProcessedEmail, 
    classification: EmailClassification, 
    jobs: Job[]
  ): { job: Job | null; confidence: number } {
    let bestMatch: Job | null = null;
    let bestScore = 0;

    for (const job of jobs) {
      let score = 0;
      let factors = 0;

      // Company matching (enhanced with entity extraction)
      const companyScore = this.compareCompanyNames(
        classification.entities.company || email.company,
        job.company
      );
      score += companyScore * 0.3;
      factors += 0.3;

      // Position matching (enhanced with entity extraction)
      const positionScore = this.comparePositions(
        classification.entities.position || '',
        job.role
      );
      score += positionScore * 0.25;
      factors += 0.25;

      // Timeline progression logic
      const progressionScore = this.calculateProgressionScore(classification.stage, job.status);
      score += progressionScore * 0.2;
      factors += 0.2;

      // Date proximity with stage-aware logic
      const dateScore = this.calculateIntelligentDateScore(
        email.date,
        new Date(job.applicationDate),
        classification.stage
      );
      score += dateScore * 0.15;
      factors += 0.15;

      // Keyword relevance
      const keywordScore = this.calculateKeywordRelevance(classification.keywords, job);
      score += keywordScore * 0.1;
      factors += 0.1;

      const finalScore = factors > 0 ? score / factors : 0;
      
      if (finalScore > bestScore && finalScore > 0.6) {
        bestScore = finalScore;
        bestMatch = job;
      }
    }

    return { job: bestMatch, confidence: bestScore };
  }

  // Enhanced company name comparison
  private compareCompanyNames(emailCompany: string, jobCompany: string): number {
    if (!emailCompany || !jobCompany) return 0;

    const normalize = (name: string) => name.toLowerCase()
      .replace(/\b(inc|ltd|llc|corp|corporation|company|co)\b/g, '')
      .replace(/[^\w\s]/g, '')
      .trim();

    const email = normalize(emailCompany);
    const job = normalize(jobCompany);

    if (email === job) return 1;
    if (email.includes(job) || job.includes(email)) return 0.9;

    // Check for common abbreviations
    const emailWords = email.split(/\s+/);
    const jobWords = job.split(/\s+/);
    
    let matchingWords = 0;
    for (const emailWord of emailWords) {
      for (const jobWord of jobWords) {
        if (emailWord.length > 2 && jobWord.length > 2) {
          if (emailWord === jobWord || 
              emailWord.startsWith(jobWord) || 
              jobWord.startsWith(emailWord)) {
            matchingWords++;
            break;
          }
        }
      }
    }

    return Math.max(emailWords.length, jobWords.length) > 0 
      ? matchingWords / Math.max(emailWords.length, jobWords.length) 
      : 0;
  }

  // Enhanced position comparison
  private comparePositions(emailPosition: string, jobPosition: string): number {
    if (!emailPosition || !jobPosition) return 0.5;

    const normalize = (pos: string) => pos.toLowerCase()
      .replace(/\b(senior|junior|sr|jr|lead|principal)\b/g, '')
      .trim();

    const email = normalize(emailPosition);
    const job = normalize(jobPosition);

    if (email === job) return 1;
    if (email.includes(job) || job.includes(email)) return 0.8;

    // Check for role synonyms
    const synonyms: Record<string, string[]> = {
      'developer': ['engineer', 'programmer', 'coder'],
      'engineer': ['developer', 'programmer'],
      'manager': ['lead', 'supervisor', 'director'],
      'analyst': ['specialist', 'associate'],
      'designer': ['artist', 'creative']
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if ((email.includes(key) && values.some(v => job.includes(v))) ||
          (job.includes(key) && values.some(v => email.includes(v)))) {
        return 0.7;
      }
    }

    return 0;
  }

  // Calculate progression score based on stage logic
  private calculateProgressionScore(emailStage: JobStage, jobStatus: string): number {
    const stageOrder: Record<string, number> = {
      'applied': 1,
      'application_submitted': 1,
      'application_received': 2,
      'under_review': 3,
      'shortlisted': 4,
      'assessment_invited': 5,
      'assessment_completed': 6,
      'interview': 7,
      'interview_invited': 7,
      'interview_scheduled': 8,
      'interview_completed': 9,
      'reference_check': 10,
      'final_review': 11,
      'offer': 12,
      'offer_extended': 12,
      'offer_accepted': 13,
      'rejected': 14,
      'withdrawn': 14
    };

    const emailOrder = stageOrder[emailStage] || 0;
    const jobOrder = stageOrder[jobStatus] || 0;

    // Email stage should be same or higher than current job status
    if (emailOrder >= jobOrder) return 1;
    if (emailOrder === jobOrder - 1) return 0.8;
    if (emailOrder === jobOrder - 2) return 0.6;
    
    return 0.3;
  }

  // Intelligent date scoring based on stage
  private calculateIntelligentDateScore(
    emailDate: Date,
    applicationDate: Date,
    stage: JobStage
  ): number {
    const diffDays = Math.floor((emailDate.getTime() - applicationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 0; // Email before application

    // Different stages have different expected timeframes
    const stageTimeframes: Record<JobStage, { min: number; max: number; optimal: number }> = {
      'application_received': { min: 0, max: 3, optimal: 1 },
      'under_review': { min: 1, max: 14, optimal: 7 },
      'shortlisted': { min: 3, max: 21, optimal: 10 },
      'assessment_invited': { min: 5, max: 28, optimal: 14 },
      'interview_invited': { min: 7, max: 35, optimal: 21 },
      'offer_extended': { min: 14, max: 60, optimal: 30 },
      'rejected': { min: 1, max: 90, optimal: 21 }
    } as any;

    const timeframe = stageTimeframes[stage];
    if (!timeframe) return 0.5;

    if (diffDays <= timeframe.optimal) {
      return 1 - (Math.abs(diffDays - timeframe.optimal) / timeframe.optimal) * 0.3;
    } else if (diffDays <= timeframe.max) {
      return 0.7 - ((diffDays - timeframe.optimal) / (timeframe.max - timeframe.optimal)) * 0.4;
    } else {
      return 0.3;
    }
  }

  // Calculate keyword relevance
  private calculateKeywordRelevance(keywords: string[], job: Job): number {
    const jobText = (job.role + ' ' + job.company + ' ' + (job.notes || '')).toLowerCase();
    const relevantKeywords = keywords.filter(keyword => jobText.includes(keyword.toLowerCase()));
    
    return keywords.length > 0 ? relevantKeywords.length / keywords.length : 0.5;
  }

  // Get all emails for a specific job
  private getJobEmails(jobId: string, allEmails: ProcessedEmail[]): ProcessedEmail[] {
    // This would typically query a database or storage
    // For now, return empty array as placeholder
    return [];
  }

  // Determine suggested action with intelligence
  private determineSuggestedAction(
    classification: EmailClassification,
    matchedJob: Job | null,
    confidence: number
  ): IntelligentEmailMatch['suggestedAction'] {
    if (confidence < 0.4) return 'ignore';

    if (matchedJob && confidence > 0.7) {
      // High confidence match - suggest adding to timeline
      return 'add_to_timeline';
    }

    if (matchedJob && confidence > 0.5) {
      // Medium confidence - suggest status update
      return 'update_status';
    }

    if (!matchedJob && classification.stage === 'application_received' && confidence > 0.6) {
      // New application detected
      return 'create_job';
    }

    return 'ignore';
  }

  // Build intelligent job timeline
  buildJobTimeline(jobId: string, emails: ProcessedEmail[]): JobTimeline | null {
    if (!emails || emails.length === 0) {
      console.warn(`No emails found for jobId: ${jobId}`);
      return null;
    }

    const jobEmails = emails.filter(email => {
      // Placeholder logic for filtering job-related emails
      return true;
    });

    const stages = jobEmails.map(email => {
      const classification = nlpService.classifyEmail(email.subject, email.fullContent || email.snippet);
      return {
        stage: classification.stage,
        date: email.date,
        emailId: email.id,
        confidence: classification.confidence,
        sentiment: classification.sentiment,
        notes: email.snippet
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());

    const currentStage = stages.length > 0 ? stages[stages.length - 1].stage : 'application_submitted';

    const confidence = nlpService.generateTimelineConfidence(
      stages.map(s => ({
        classification: { stage: s.stage, sentiment: s.sentiment, confidence: s.confidence },
        date: s.date
      })),
      currentStage
    );

    return {
      jobId,
      stages,
      currentStage,
      confidence,
      predictions: confidence.nextPredictions
    };
  }

  // Generate proactive alerts
  generateProactiveAlerts(timelines: JobTimeline[]): Array<{
    jobId: string;
    type: 'follow_up_reminder' | 'stage_prediction' | 'deadline_warning' | 'opportunity_alert';
    message: string;
    urgency: 'low' | 'medium' | 'high';
    actionable: boolean;
  }> {
    const alerts: Array<{
      jobId: string;
      type: 'follow_up_reminder' | 'stage_prediction' | 'deadline_warning' | 'opportunity_alert';
      message: string;
      urgency: 'low' | 'medium' | 'high';
      actionable: boolean;
    }> = [];

    for (const timeline of timelines) {
      const lastStage = timeline.stages[timeline.stages.length - 1];
      if (!lastStage) continue;

      const daysSinceLastUpdate = Math.floor((Date.now() - lastStage.date.getTime()) / (1000 * 60 * 60 * 24));

      // Follow-up reminders
      if (daysSinceLastUpdate >= 10 && !['rejected', 'offer_accepted', 'withdrawn'].includes(timeline.currentStage)) {
        alerts.push({
          jobId: timeline.jobId,
          type: 'follow_up_reminder',
          message: `It's been ${daysSinceLastUpdate} days since your last update. Consider following up.`,
          urgency: daysSinceLastUpdate > 21 ? 'high' : 'medium',
          actionable: true
        });
      }

      // Stage predictions
      const highProbabilityPrediction = timeline.predictions.find(p => p.probability > 0.7);
      if (highProbabilityPrediction && daysSinceLastUpdate >= 7) {
        alerts.push({
          jobId: timeline.jobId,
          type: 'stage_prediction',
          message: `High probability of moving to ${highProbabilityPrediction.stage} stage within ${highProbabilityPrediction.timeframe}.`,
          urgency: 'low',
          actionable: false
        });
      }

      // Deadline warnings for assessments
      if (timeline.currentStage === 'assessment_invited' && daysSinceLastUpdate >= 3) {
        alerts.push({
          jobId: timeline.jobId,
          type: 'deadline_warning',
          message: `Assessment invitation received ${daysSinceLastUpdate} days ago. Complete soon to avoid missing the deadline.`,
          urgency: daysSinceLastUpdate > 7 ? 'high' : 'medium',
          actionable: true
        });
      }
    }

    return alerts;
  }
}

export const intelligentEmailProcessor = new IntelligentEmailProcessor();
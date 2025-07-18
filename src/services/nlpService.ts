// Natural Language Processing Service for Job Application Intelligence
export interface EmailClassification {
  stage: JobStage;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keywords: string[];
  entities: {
    company?: string;
    position?: string;
    interviewer?: string;
    date?: Date;
    location?: string;
  };
}

export type JobStage = 
  | 'application_submitted'
  | 'application_received'
  | 'under_review'
  | 'shortlisted'
  | 'assessment_invited'
  | 'assessment_completed'
  | 'interview_invited'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'reference_check'
  | 'final_review'
  | 'offer_extended'
  | 'offer_accepted'
  | 'offer_declined'
  | 'rejected'
  | 'withdrawn';

export interface StagePattern {
  stage: JobStage;
  patterns: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  weight: number;
  nextStages: { stage: JobStage; probability: number }[];
}

export interface TimelineConfidence {
  stage: JobStage;
  confidence: number;
  reasoning: string[];
  nextPredictions: { stage: JobStage; probability: number; timeframe: string }[];
}

class NLPService {
  private stagePatterns: StagePattern[] = [
    {
      stage: 'application_received',
      patterns: {
        positive: [
          'thank you for your application',
          'application received',
          'we have received your application',
          'application submitted successfully',
          'confirmation of your application'
        ],
        negative: [],
        neutral: ['application status', 'received your resume']
      },
      weight: 0.9,
      nextStages: [
        { stage: 'under_review', probability: 0.8 },
        { stage: 'rejected', probability: 0.2 }
      ]
    },
    {
      stage: 'under_review',
      patterns: {
        positive: [
          'reviewing your application',
          'under consideration',
          'being reviewed by our team',
          'in the review process'
        ],
        negative: [],
        neutral: ['status update', 'application review']
      },
      weight: 0.7,
      nextStages: [
        { stage: 'shortlisted', probability: 0.4 },
        { stage: 'assessment_invited', probability: 0.3 },
        { stage: 'rejected', probability: 0.3 }
      ]
    },
    {
      stage: 'shortlisted',
      patterns: {
        positive: [
          'you have been shortlisted',
          'shortlisted for the position',
          'selected for the next round',
          'impressed with your profile',
          'move forward with your application'
        ],
        negative: [
          'you were not shortlisted',
          'not selected for shortlisting',
          'did not make the shortlist'
        ],
        neutral: ['shortlist update', 'selection process']
      },
      weight: 0.95,
      nextStages: [
        { stage: 'assessment_invited', probability: 0.5 },
        { stage: 'interview_invited', probability: 0.5 }
      ]
    },
    {
      stage: 'assessment_invited',
      patterns: {
        positive: [
          'coding challenge',
          'technical assessment',
          'online test',
          'complete the assessment',
          'take home assignment',
          'technical task'
        ],
        negative: [],
        neutral: ['assessment details', 'test instructions']
      },
      weight: 0.9,
      nextStages: [
        { stage: 'assessment_completed', probability: 0.9 },
        { stage: 'withdrawn', probability: 0.1 }
      ]
    },
    {
      stage: 'interview_invited',
      patterns: {
        positive: [
          'interview invitation',
          'invite you for an interview',
          'schedule an interview',
          'would like to interview you',
          'interview opportunity'
        ],
        negative: [],
        neutral: ['interview details', 'meeting request']
      },
      weight: 0.95,
      nextStages: [
        { stage: 'interview_scheduled', probability: 0.8 },
        { stage: 'withdrawn', probability: 0.2 }
      ]
    },
    {
      stage: 'interview_scheduled',
      patterns: {
        positive: [
          'interview confirmed',
          'interview scheduled',
          'looking forward to meeting',
          'interview details confirmed'
        ],
        negative: [
          'interview cancelled',
          'need to reschedule',
          'postpone the interview'
        ],
        neutral: ['interview reminder', 'meeting details']
      },
      weight: 0.9,
      nextStages: [
        { stage: 'interview_completed', probability: 0.9 },
        { stage: 'withdrawn', probability: 0.1 }
      ]
    },
    {
      stage: 'offer_extended',
      patterns: {
        positive: [
          'job offer',
          'offer of employment',
          'pleased to offer',
          'congratulations',
          'welcome to the team',
          'offer letter'
        ],
        negative: [],
        neutral: ['offer details', 'employment terms']
      },
      weight: 0.98,
      nextStages: [
        { stage: 'offer_accepted', probability: 0.7 },
        { stage: 'offer_declined', probability: 0.3 }
      ]
    },
    {
      stage: 'rejected',
      patterns: {
        positive: [],
        negative: [
          'unfortunately',
          'regret to inform',
          'not moving forward',
          'not selected',
          'unsuccessful',
          'decided not to proceed',
          'chosen another candidate'
        ],
        neutral: ['application status', 'decision update']
      },
      weight: 0.95,
      nextStages: []
    }
  ];

  // Classify email content using NLP patterns
  classifyEmail(subject: string, content: string): EmailClassification {
    const text = (subject + ' ' + content).toLowerCase();
    const words = text.split(/\s+/);
    
    let bestMatch: { stage: JobStage; sentiment: 'positive' | 'neutral' | 'negative'; confidence: number } = {
      stage: 'under_review',
      sentiment: 'neutral',
      confidence: 0
    };

    // Analyze each stage pattern
    for (const pattern of this.stagePatterns) {
      const scores = this.calculatePatternScores(text, pattern);
      
      if (scores.maxScore > bestMatch.confidence) {
        bestMatch = {
          stage: pattern.stage,
          sentiment: scores.sentiment,
          confidence: scores.maxScore * pattern.weight
        };
      }
    }

    // Extract entities
    const entities = this.extractEntities(subject, content);
    
    // Extract relevant keywords
    const keywords = this.extractKeywords(text);

    return {
      stage: bestMatch.stage,
      sentiment: bestMatch.sentiment,
      confidence: bestMatch.confidence,
      keywords,
      entities
    };
  }

  // Calculate pattern matching scores
  private calculatePatternScores(text: string, pattern: StagePattern) {
    const sentiments = ['positive', 'negative', 'neutral'] as const;
    const scores: Record<string, number> = {};

    for (const sentiment of sentiments) {
      scores[sentiment] = 0;
      for (const phrase of pattern.patterns[sentiment]) {
        if (text.includes(phrase.toLowerCase())) {
          // Boost score for exact phrase matches
          scores[sentiment] += 1.0;
        } else {
          // Partial word matching
          const phraseWords = phrase.toLowerCase().split(/\s+/);
          const matchedWords = phraseWords.filter(word => text.includes(word));
          scores[sentiment] += (matchedWords.length / phraseWords.length) * 0.5;
        }
      }
    }

    const maxScore = Math.max(...Object.values(scores));
    const sentiment = Object.keys(scores).find(key => scores[key] === maxScore) as 'positive' | 'neutral' | 'negative';

    return { maxScore, sentiment };
  }

  // Extract entities from email content
  private extractEntities(subject: string, content: string) {
    const entities: EmailClassification['entities'] = {};
    const text = subject + ' ' + content;

    // Extract company name
    const companyPatterns = [
      /at ([A-Z][a-zA-Z\s&]+)/,
      /from ([A-Z][a-zA-Z\s&]+)/,
      /([A-Z][a-zA-Z\s&]+) team/i,
      /([A-Z][a-zA-Z\s&]+) careers/i
    ];

    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) {
        entities.company = match[1].trim();
        break;
      }
    }

    // Extract position/role
    const positionPatterns = [
      /for the (.+?) position/i,
      /for the (.+?) role/i,
      /(.+?) position at/i,
      /(.+?) role at/i
    ];

    for (const pattern of positionPatterns) {
      const match = text.match(pattern);
      if (match) {
        entities.position = match[1].trim();
        break;
      }
    }

    // Extract dates
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{1,2}-\d{1,2}-\d{4})/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          entities.date = date;
          break;
        }
      }
    }

    return entities;
  }

  // Extract relevant keywords
  private extractKeywords(text: string): string[] {
    const jobKeywords = [
      'interview', 'assessment', 'coding', 'technical', 'offer', 'salary',
      'benefits', 'start date', 'onboarding', 'reference', 'background check',
      'contract', 'full-time', 'part-time', 'remote', 'hybrid', 'office'
    ];

    return jobKeywords.filter(keyword => text.includes(keyword.toLowerCase()));
  }

  // Predict next stages based on current stage and historical patterns
  predictNextStages(currentStage: JobStage, daysSinceLastUpdate: number): TimelineConfidence['nextPredictions'] {
    const pattern = this.stagePatterns.find(p => p.stage === currentStage);
    if (!pattern) return [];

    return pattern.nextStages.map(next => {
      // Adjust probability based on time elapsed
      let adjustedProbability = next.probability;
      
      if (daysSinceLastUpdate > 14) {
        adjustedProbability *= 0.7; // Reduce probability if too much time has passed
      } else if (daysSinceLastUpdate > 7) {
        adjustedProbability *= 0.9;
      }

      // Determine timeframe
      let timeframe = '1-3 days';
      if (next.stage === 'interview_invited') timeframe = '3-7 days';
      if (next.stage === 'offer_extended') timeframe = '1-2 weeks';
      if (next.stage === 'rejected') timeframe = '1-4 weeks';

      return {
        stage: next.stage,
        probability: Math.min(adjustedProbability, 1.0),
        timeframe
      };
    });
  }

  // Generate timeline confidence analysis
  generateTimelineConfidence(
    emails: Array<{ classification: EmailClassification; date: Date }> | undefined,
    currentStage: JobStage
  ): TimelineConfidence {
    const reasoning: string[] = [];
    let confidence = 0.5;

    // Defensive check
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      console.warn("Emails input is undefined or not an array.");
      return {
        stage: currentStage,
        confidence,
        reasoning,
        nextPredictions: []
      };
    }

    // Safe to proceed
    const sortedEmails = emails.sort((a, b) => a.date.getTime() - b.date.getTime());
    const latestEmail = sortedEmails[sortedEmails.length - 1];
    confidence = latestEmail.classification.confidence;

    // Additional logic...
    return {
      stage: currentStage,
      confidence: Math.min(Math.max(confidence, 0), 1),
      reasoning,
      nextPredictions: this.predictNextStages(currentStage, 0)
    };
  }

  // Validate if stage progression makes logical sense
  private validateStageProgression(stages: JobStage[]): boolean {
    const stageOrder: Record<JobStage, number> = {
      'application_submitted': 1,
      'application_received': 2,
      'under_review': 3,
      'shortlisted': 4,
      'assessment_invited': 5,
      'assessment_completed': 6,
      'interview_invited': 7,
      'interview_scheduled': 8,
      'interview_completed': 9,
      'reference_check': 10,
      'final_review': 11,
      'offer_extended': 12,
      'offer_accepted': 13,
      'offer_declined': 13,
      'rejected': 14,
      'withdrawn': 14
    };

    for (let i = 1; i < stages.length; i++) {
      const currentOrder = stageOrder[stages[i]];
      const previousOrder = stageOrder[stages[i - 1]];
      
      // Allow some flexibility in progression
      if (currentOrder < previousOrder - 2) {
        return false;
      }
    }

    return true;
  }

  // Generate smart follow-up suggestions
  generateFollowUpSuggestions(
    lastEmailDate: Date,
    currentStage: JobStage,
    sentiment: 'positive' | 'neutral' | 'negative'
  ): Array<{ type: 'follow_up' | 'thank_you' | 'status_inquiry'; message: string; urgency: 'low' | 'medium' | 'high' }> {
    const daysSince = Math.floor((Date.now() - lastEmailDate.getTime()) / (1000 * 60 * 60 * 24));
    const suggestions: Array<{ type: 'follow_up' | 'thank_you' | 'status_inquiry'; message: string; urgency: 'low' | 'medium' | 'high' }> = [];

    if (currentStage === 'interview_completed' && daysSince >= 3) {
      suggestions.push({
        type: 'thank_you',
        message: `It's been ${daysSince} days since your interview. Consider sending a thank-you note.`,
        urgency: daysSince > 7 ? 'high' : 'medium'
      });
    }

    if (currentStage === 'assessment_invited' && daysSince >= 2) {
      suggestions.push({
        type: 'follow_up',
        message: `Assessment invitation received ${daysSince} days ago. Complete it soon to show interest.`,
        urgency: daysSince > 5 ? 'high' : 'medium'
      });
    }

    if (['under_review', 'shortlisted'].includes(currentStage) && daysSince >= 14) {
      suggestions.push({
        type: 'status_inquiry',
        message: `No updates for ${daysSince} days. Consider a polite status inquiry.`,
        urgency: daysSince > 21 ? 'high' : 'medium'
      });
    }

    return suggestions;
  }

  // Generate smart email templates
  generateEmailTemplate(
    type: 'follow_up' | 'thank_you' | 'status_inquiry',
    context: {
      companyName: string;
      position: string;
      interviewerName?: string;
      lastInteractionDate?: Date;
    }
  ): { subject: string; body: string } {
    const templates = {
      thank_you: {
        subject: `Thank you for the ${context.position} interview`,
        body: `Dear ${context.interviewerName || 'Hiring Team'},

Thank you for taking the time to interview me for the ${context.position} position at ${context.companyName}. I enjoyed our conversation and learning more about the role and your team.

I'm very excited about the opportunity to contribute to ${context.companyName} and believe my skills align well with your needs. Please let me know if you need any additional information from me.

I look forward to hearing about the next steps.

Best regards,
[Your Name]`
      },
      follow_up: {
        subject: `Following up on ${context.position} application`,
        body: `Dear Hiring Team,

I hope this email finds you well. I wanted to follow up on my application for the ${context.position} position at ${context.companyName}.

I remain very interested in this opportunity and would welcome the chance to discuss how my background and skills can contribute to your team's success.

Please let me know if you need any additional information or if there are any updates on the hiring timeline.

Thank you for your time and consideration.

Best regards,
[Your Name]`
      },
      status_inquiry: {
        subject: `Status inquiry: ${context.position} position`,
        body: `Dear Hiring Team,

I hope you're doing well. I wanted to check in regarding the status of my application for the ${context.position} position at ${context.companyName}.

I understand that hiring processes can take time, and I wanted to reiterate my strong interest in this role. If there's any additional information I can provide to assist in your decision-making process, please let me know.

I appreciate your time and look forward to hearing from you.

Best regards,
[Your Name]`
      }
    };

    return templates[type];
  }
}

export const nlpService = new NLPService();
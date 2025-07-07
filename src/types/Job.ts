
export interface Job {
  id: string;
  company: string;
  role: string;
  platform: string;
  applicationDate: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  notes?: string;
  url?: string;
  testDate?: string;
  interviewDate?: string;
}

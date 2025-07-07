import React, { createContext, useContext, useState, ReactNode } from "react";

export type JobStatus = "applied" | "interview" | "offer" | "rejected";
export interface Job {
  id: string;
  company: string;
  role: string;
  platform: string;
  applicationDate: string;
  status: JobStatus;
  notes: string;
  interviewDate?: string;
}

interface JobsContextType {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  deleteJob: (id: string) => void; // Add this
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<Job[]>(
    [
      {
        id: "1",
        company: "Google",
        role: "Software Engineer Intern",
        platform: "LinkedIn",
        applicationDate: "2024-07-01",
        status: "interview",
        notes: "Great company culture, technical interview scheduled",
        interviewDate: "2024-07-10",
      },
      {
        id: "2",
        company: "Microsoft",
        role: "Product Manager Intern",
        platform: "Company Website",
        applicationDate: "2024-06-25",
        status: "applied",
        notes: "Applied through career portal",
      },
      {
        id: "3",
        company: "Meta",
        role: "Frontend Developer",
        platform: "Internshala",
        applicationDate: "2024-06-20",
        status: "offer",
        notes: "Received offer! Great team and compensation",
      },
    ]
  );

  const deleteJob = (id: string) => setJobs(jobs => jobs.filter(job => job.id !== id));

  return (
    <JobsContext.Provider value={{ jobs, setJobs, deleteJob }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) throw new Error("useJobs must be used within JobsProvider");
  return context;
};
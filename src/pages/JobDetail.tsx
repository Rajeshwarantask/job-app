import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Job } from "@/types/Job";
import { JobTimeline } from "@/components/JobTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ExternalLink, Building2, Calendar, Globe, FileText, Bell, Edit2, Save, X } from "lucide-react";
import { useJobs } from "@/context/JobsContext";

interface JobDetailProps {
  jobs: Job[];
  onUpdateJobStatus: (jobId: string, status: Job['status']) => void;
}

const statusColors = {
  applied: 'bg-blue-100 text-blue-800',
  interview: 'bg-purple-100 text-purple-800',
  offer: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

export const JobDetail = ({ jobs, onUpdateJobStatus }: JobDetailProps) => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { deleteJob } = useJobs();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [editedTestDate, setEditedTestDate] = useState("");
  const [editedInterviewDate, setEditedInterviewDate] = useState("");
  
  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Job Not Found</h1>
            <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleEditNotes = () => {
    setEditedNotes(job.notes || "");
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    // In a real app, you'd update the job here
    console.log("Saving notes:", editedNotes);
    setIsEditingNotes(false);
  };

  const handleEditDates = () => {
    setEditedTestDate(job.testDate || "");
    setEditedInterviewDate(job.interviewDate || "");
    setIsEditingDates(true);
  };

  const handleSaveDates = () => {
    // In a real app, you'd update the job dates here
    console.log("Saving dates:", { testDate: editedTestDate, interviewDate: editedInterviewDate });
    setIsEditingDates(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Bell className="h-4 w-4 mr-2" />
            Set Reminder
          </Button>
        </div>

        {/* Job Header */}
        <Card className="bg-white border border-gray-200 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl text-gray-800 mb-2">{job.role}</CardTitle>
                <div className="flex items-center space-x-4 text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span className="text-lg">{job.company}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">{job.platform}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Applied {new Date(job.applicationDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge className={`${statusColors[job.status]} text-sm`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
              </div>
              
              {job.url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(job.url, '_blank')}
                  className="border-gray-300 text-gray-600 hover:text-gray-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Job Posting
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <JobTimeline job={job} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800 text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                  onClick={() => onUpdateJobStatus(job.id, 'interview')}
                  disabled={job.status === 'interview' || job.status === 'offer'}
                >
                  Mark as Interview
                </Button>
                <Button 
                  className="w-full bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                  onClick={() => onUpdateJobStatus(job.id, 'offer')}
                  disabled={job.status === 'offer'}
                >
                  Mark as Offer
                </Button>
                <Button 
                  className="w-full bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                  onClick={() => onUpdateJobStatus(job.id, 'rejected')}
                  disabled={job.status === 'rejected'}
                >
                  Mark as Rejected
                </Button>
              </CardContent>
            </Card>

            {/* Notes - Editable */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-800 text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Notes
                  </CardTitle>
                  {!isEditingNotes && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditNotes}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingNotes ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Add your notes..."
                      className="min-h-20"
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveNotes}>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setIsEditingNotes(false)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {job.notes || "No notes added yet"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Important Dates - Editable */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-800 text-lg">Important Dates</CardTitle>
                  {!isEditingDates && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditDates}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingDates ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">Test Date</label>
                      <Input
                        type="date"
                        value={editedTestDate}
                        onChange={(e) => setEditedTestDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-1 block">Interview Date</label>
                      <Input
                        type="date"
                        value={editedInterviewDate}
                        onChange={(e) => setEditedInterviewDate(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveDates}>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setIsEditingDates(false)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Applied</span>
                      <span className="text-gray-700 text-sm">{new Date(job.applicationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Test Date</span>
                      <span className="text-gray-700 text-sm">
                        {job.testDate ? new Date(job.testDate).toLocaleDateString() : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Interview</span>
                      <span className="text-gray-700 text-sm">
                        {job.interviewDate ? new Date(job.interviewDate).toLocaleDateString() : "Not set"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;

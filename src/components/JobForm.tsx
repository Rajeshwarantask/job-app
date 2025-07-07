
import { useState } from "react";
import { Job } from "@/types/Job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobFormProps {
  onSubmit: (job: Omit<Job, 'id'>) => void;
  onClose: () => void;
}

export const JobForm = ({ onSubmit, onClose }: JobFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    platform: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'applied' as Job['status'],
    notes: '',
    url: '',
    testDate: '',
    interviewDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company || !formData.role || !formData.platform) {
      toast({
        title: "Missing Information",
        description: "Please fill in company, role, and platform fields.",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
    toast({
      title: "Job Added Successfully",
      description: `${formData.role} at ${formData.company} has been added to your tracker.`,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-2xl my-4 md:my-8">
        <Card className="bg-slate-900/95 border-white/20 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-slate-900/95 z-10 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-xl text-white">Add New Job Application</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-300">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="e.g. Google, Microsoft"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-300">Role *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    placeholder="e.g. Software Engineer Intern"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-gray-300">Platform *</Label>
                  <Select value={formData.platform} onValueChange={(value) => handleChange('platform', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Internshala">Internshala</SelectItem>
                      <SelectItem value="Company Website">Company Website</SelectItem>
                      <SelectItem value="Indeed">Indeed</SelectItem>
                      <SelectItem value="AngelList">AngelList</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicationDate" className="text-gray-300">Application Date</Label>
                  <Input
                    id="applicationDate"
                    type="date"
                    value={formData.applicationDate}
                    onChange={(e) => handleChange('applicationDate', e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-gray-300">Job URL (Optional)</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-300">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Add any additional notes about this application..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sticky bottom-0 bg-slate-900/95 pb-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose}
                  className="text-gray-400 hover:text-white w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white w-full sm:w-auto"
                >
                  Add Job Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

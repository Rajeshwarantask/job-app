import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GmailIntegration } from "@/components/GmailIntegration";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const EmailSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Email Integration</h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Connect your Gmail to automatically track job applications and receive smart notifications.
            </p>
          </div>

          <div className="max-w-4xl">
            <GmailIntegration />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
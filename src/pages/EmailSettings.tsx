import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmailCredentialsSetup } from "@/components/EmailCredentialsSetup";
import { EmailConnectCard } from "@/components/EmailConnectCard";
import { EmailInboxDisplay } from "@/components/EmailInboxDisplay";
import { useGmail } from "@/context/GmailContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const EmailSettings = () => {
  const navigate = useNavigate();
  const { 
    hasCredentials, 
    isConnected, 
    isConnecting, 
    processedEmails, 
    userEmail,
    setCredentials,
    connectGmail, 
    disconnectGmail, 
    syncEmails 
  } = useGmail();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncEmails();
    setIsRefreshing(false);
  };

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
              Set up your Google OAuth credentials and connect Gmail to automatically track job applications.
            </p>
          </div>

          <div className="max-w-4xl space-y-6">
            {/* Step 1: OAuth Credentials Setup */}
            <EmailCredentialsSetup 
              onCredentialsSet={setCredentials}
              isConnected={hasCredentials}
            />

            {/* Step 2: Gmail Connection */}
            <EmailConnectCard
              hasCredentials={hasCredentials}
              isConnected={isConnected}
              isConnecting={isConnecting}
              onConnect={connectGmail}
              onDisconnect={disconnectGmail}
              userEmail={userEmail || undefined}
            />

            {/* Step 3: Email Display */}
            {isConnected && (
              <EmailInboxDisplay
                isConnected={isConnected}
                emails={processedEmails}
                onRefresh={handleRefresh}
                isLoading={isRefreshing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
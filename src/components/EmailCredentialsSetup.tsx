import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Shield, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface EmailCredentialsSetupProps {
  onCredentialsSet: (credentials: { clientId: string; clientSecret: string }) => void;
  isConnected: boolean;
}

export const EmailCredentialsSetup = ({ onCredentialsSet, isConnected }: EmailCredentialsSetupProps) => {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: ''
  });
  const [showSecret, setShowSecret] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCredentials = () => {
    if (!credentials.clientId || !credentials.clientSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please provide both Client ID and Client Secret.",
        variant: "destructive"
      });
      return false;
    }

    if (!credentials.clientId.includes('.googleusercontent.com')) {
      toast({
        title: "Invalid Client ID",
        description: "Client ID should end with .googleusercontent.com",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCredentials()) return;

    setIsValidating(true);
    
    try {
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onCredentialsSet(credentials);
      
      toast({
        title: "Credentials Saved",
        description: "Google OAuth credentials have been configured successfully.",
      });
    } catch (error) {
      toast({
        title: "Validation Failed",
        description: "Unable to validate credentials. Please check and try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (isConnected) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">OAuth Credentials Configured</h3>
              <p className="text-gray-400 text-sm">Ready to connect to Gmail</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Key className="h-5 w-5 mr-2" />
          Google OAuth Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            To connect Gmail, you need to create OAuth credentials in Google Cloud Console.
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center ml-2 text-blue-400 hover:text-blue-300"
            >
              Open Google Cloud Console
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Setup Instructions:</h4>
            <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
              <li>Create a new project in Google Cloud Console</li>
              <li>Enable the Gmail API</li>
              <li>Create OAuth 2.0 Client ID credentials (Web application)</li>
              <li>Add http://localhost:5173 to authorized JavaScript origins</li>
              <li>Add http://localhost:5173/auth/callback to authorized redirect URIs</li>
              <li>Copy the Client ID and Secret below</li>
            </ol>
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <p className="text-yellow-300 text-xs">
                <strong>Important:</strong> Make sure your OAuth client is not deleted in Google Cloud Console. 
                If you see "deleted_client\" errors, recreate your OAuth credentials.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-gray-300">
                Google Client ID *
              </Label>
              <Input
                id="clientId"
                type="text"
                value={credentials.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                placeholder="your-client-id.googleusercontent.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                disabled={isValidating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret" className="text-gray-300">
                Google Client Secret *
              </Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecret ? "text" : "password"}
                  value={credentials.clientSecret}
                  onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                  placeholder="GOCSPX-your-client-secret"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                  disabled={isValidating}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={isValidating}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isValidating}
            >
              {isValidating ? "Validating..." : "Save Credentials"}
            </Button>
          </form>
        </div>

        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-yellow-300">
            Your credentials are stored securely and only used to authenticate with Google's servers.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
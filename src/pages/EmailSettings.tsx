import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGmail } from "@/context/GmailContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Mail, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  User,
  Calendar,
  Shield
} from "lucide-react";
import { PWAStatus } from '@/components/PWAStatus';

export const EmailSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    hasCredentials, 
    isConnected, 
    isConnecting, 
    processedEmails, 
    userEmail,
    lastSync,
    setCredentials,
    connectGmail, 
    disconnectGmail, 
    syncEmails 
  } = useGmail();

  const [showCredentialsForm, setShowCredentialsForm] = useState(!hasCredentials);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [credentials, setCredentialsState] = useState({
    clientId: '',
    clientSecret: ''
  });

  const handleSaveCredentials = () => {
    if (!credentials.clientId || !credentials.clientSecret) {
      toast({
        title: "Missing Information",
        description: "Please provide both Client ID and Client Secret.",
        variant: "destructive"
      });
      return;
    }

    if (!credentials.clientId.includes('.googleusercontent.com')) {
      toast({
        title: "Invalid Client ID",
        description: "Client ID should end with .googleusercontent.com",
        variant: "destructive"
      });
      return;
    }

    setCredentials(credentials);
    setShowCredentialsForm(false);
    setIsEditingCredentials(false);
    setCredentialsState({ clientId: '', clientSecret: '' });
  };

  const handleDeleteCredentials = () => {
    if (isConnected) {
      toast({
        title: "Cannot Delete",
        description: "Please disconnect Gmail first before deleting credentials.",
        variant: "destructive"
      });
      return;
    }

    // Clear credentials from localStorage
    const userId = localStorage.getItem('jobtrail_user') ? JSON.parse(localStorage.getItem('jobtrail_user')!).id : null;
    if (userId) {
      localStorage.removeItem(`gmail_credentials_${userId}`);
    }
    
    setShowCredentialsForm(true);
    toast({
      title: "Credentials Deleted",
      description: "OAuth credentials have been removed.",
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncEmails();
    setIsSyncing(false);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Email Integration</h1>
            <p className="text-xl text-gray-300">
              Connect and manage your Gmail account to automatically track job applications.
            </p>
          </div>

          <div className="space-y-6">
            {/* Connection Status Overview */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {hasCredentials ? (
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-red-400" />
                      )}
                    </div>
                    <h3 className="text-white font-medium">OAuth Setup</h3>
                    <p className="text-gray-400 text-sm">
                      {hasCredentials ? 'Configured' : 'Not configured'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {isConnected ? (
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-white font-medium">Gmail Connection</h3>
                    <p className="text-gray-400 text-sm">
                      {isConnected ? userEmail : 'Not connected'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <RefreshCw className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-white font-medium">Last Sync</h3>
                    <p className="text-gray-400 text-sm">
                      {formatLastSync(lastSync)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OAuth Credentials Management */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    OAuth Credentials
                  </CardTitle>
                  <div className="flex space-x-2">
                    {hasCredentials && !showCredentialsForm && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingCredentials(true);
                            setShowCredentialsForm(true);
                          }}
                          className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteCredentials}
                          className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                          disabled={isConnected}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                    {!hasCredentials && !showCredentialsForm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCredentialsForm(true)}
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Credentials
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!showCredentialsForm && hasCredentials ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-green-300 font-medium">OAuth Credentials Configured</p>
                        <p className="text-green-400 text-sm">Ready to connect to Gmail</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Alert className="bg-blue-500/10 border-blue-500/20">
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-blue-300">
                        You need Google OAuth credentials to connect Gmail. 
                        <a 
                          href="https://console.cloud.google.com/apis/credentials" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center ml-2 text-blue-400 hover:text-blue-300 underline"
                        >
                          Create them in Google Cloud Console →
                        </a>
                      </AlertDescription>
                    </Alert>

                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Quick Setup Guide:</h4>
                      <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                        <li>Go to Google Cloud Console → APIs & Services → Credentials</li>
                        <li>Create OAuth 2.0 Client ID (Web application)</li>
                        <li>Add <code className="bg-white/10 px-1 rounded">{window.location.origin}</code> to authorized JavaScript origins</li>
                        <li>Add <code className="bg-white/10 px-1 rounded">{window.location.origin}/auth-callback.html</code> to redirect URIs</li>
                        <li>Copy Client ID and Secret below</li>
                      </ol>
                      
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                        <p className="text-red-300 text-xs">
                          <strong>⚠️ Common Errors:</strong> 
                          <br />• Make sure redirect URI is exactly: <code className="bg-white/10 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/auth-callback.html</code>
                          <br />• JavaScript origins should be: <code className="bg-white/10 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}</code> (no trailing slash)
                          <br />• For production: Use your actual domain (e.g., https://yourapp.netlify.app)
                          <br />• For localhost: Use http://localhost:5173 (not https)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientId" className="text-gray-300">
                          Google Client ID *
                        </Label>
                        <Input
                          id="clientId"
                          type="text"
                          value={credentials.clientId}
                          onChange={(e) => setCredentialsState(prev => ({ ...prev, clientId: e.target.value }))}
                          placeholder="your-client-id.googleusercontent.com"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clientSecret" className="text-gray-300">
                          Google Client Secret *
                        </Label>
                        <div className="relative">
                          <Input
                            id="clientSecret"
                            type={showClientSecret ? "text" : "password"}
                            value={credentials.clientSecret}
                            onChange={(e) => setCredentialsState(prev => ({ ...prev, clientSecret: e.target.value }))}
                            placeholder="GOCSPX-your-client-secret"
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowClientSecret(!showClientSecret)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          >
                            {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={handleSaveCredentials}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          {isEditingCredentials ? 'Update Credentials' : 'Save Credentials'}
                        </Button>
                        {showCredentialsForm && hasCredentials && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowCredentialsForm(false);
                              setIsEditingCredentials(false);
                              setCredentialsState({ clientId: '', clientSecret: '' });
                            }}
                            className="border-white/20 text-gray-300 hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gmail Account Management */}
            {hasCredentials && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Gmail Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isConnected ? (
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <Mail className="h-8 w-8 text-blue-400" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Gmail</h3>
                        <p className="text-gray-300 max-w-md mx-auto">
                          Connect your Gmail account to automatically track job application emails.
                        </p>
                      </div>

                      <Button
                        onClick={connectGmail}
                        disabled={isConnecting}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-8"
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Mail className="h-5 w-5 mr-2" />
                            Connect Gmail Account
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div>
                              <p className="text-green-300 font-medium">Gmail Connected</p>
                              <p className="text-green-400 text-sm">{userEmail}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            Active
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <Calendar className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                          <p className="text-white text-sm font-medium">Last Sync</p>
                          <p className="text-gray-400 text-xs">{formatLastSync(lastSync)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <Mail className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                          <p className="text-white text-sm font-medium">Emails Found</p>
                          <p className="text-gray-400 text-xs">{processedEmails.length} job emails</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
                          <p className="text-white text-sm font-medium">Security</p>
                          <p className="text-gray-400 text-xs">Read-only access</p>
                        </div>
                      </div>

                      <Separator className="bg-white/20" />

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleSync}
                          disabled={isSyncing}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                          {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={disconnectGmail}
                          className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Disconnect Account
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Email Activity Summary */}
            {isConnected && processedEmails.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Recent Email Activity
                    </span>
                    <Badge className="bg-blue-500/20 text-blue-300">
                      {processedEmails.length} emails
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {processedEmails.slice(0, 5).map((email) => (
                      <div key={email.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm truncate">{email.subject}</h4>
                            <p className="text-gray-400 text-xs">
                              {email.company} • {email.date.toLocaleDateString()}
                            </p>
                          </div>
                          {email.status && (
                            <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                              {email.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {processedEmails.length > 5 && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                        onClick={() => navigate("/inbox")} // Redirect to InboxViewer page
                      >
                        View All Emails ({processedEmails.length})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* PWA Status */}
          <PWAStatus />
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Zap, Settings, CheckCircle, AlertCircle, Key, Globe, Smartphone } from "lucide-react";

interface EmailIntegrationProps {
  onToggleIntegration: () => void;
}

interface EmailRule {
  id: string;
  keyword: string;
  action: 'update_status' | 'create_reminder' | 'add_note';
  targetStatus?: 'applied' | 'interview' | 'offer' | 'rejected';
  enabled: boolean;
}

interface APIConnection {
  id: string;
  name: string;
  type: 'gmail' | 'outlook' | 'yahoo' | 'imap' | 'pop3';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

export const EmailIntegration = ({ onToggleIntegration }: EmailIntegrationProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [imapSettings, setImapSettings] = useState({
    server: '',
    port: '',
    username: '',
    password: ''
  });
  
  const [emailRules] = useState<EmailRule[]>([
    {
      id: '1',
      keyword: 'We received your application',
      action: 'update_status',
      targetStatus: 'applied',
      enabled: true
    },
    {
      id: '2',
      keyword: 'You are shortlisted',
      action: 'update_status',
      targetStatus: 'interview',
      enabled: true
    },
    {
      id: '3',
      keyword: 'Congratulations',
      action: 'update_status',
      targetStatus: 'offer',
      enabled: true
    },
    {
      id: '4',
      keyword: 'Unfortunately',
      action: 'update_status',
      targetStatus: 'rejected',
      enabled: true
    },
    {
      id: '5',
      keyword: 'online test',
      action: 'create_reminder',
      enabled: true
    }
  ]);

  const [apiConnections] = useState<APIConnection[]>([
    {
      id: '1',
      name: 'Gmail API',
      type: 'gmail',
      status: 'disconnected'
    },
    {
      id: '2',
      name: 'Microsoft Outlook',
      type: 'outlook',
      status: 'disconnected'
    },
    {
      id: '3',
      name: 'IMAP Connection',
      type: 'imap',
      status: 'disconnected'
    }
  ]);

  const handleConnect = () => {
    setIsConnected(!isConnected);
    onToggleIntegration();
  };

  const handleAPIConnect = (connectionId: string) => {
    console.log(`Connecting to API: ${connectionId}`);
    // Implementation for API connection
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">Overview</TabsTrigger>
          <TabsTrigger value="apis" className="text-white data-[state=active]:bg-white/20">API Connections</TabsTrigger>
          <TabsTrigger value="rules" className="text-white data-[state=active]:bg-white/20">Smart Rules</TabsTrigger>
          <TabsTrigger value="apps" className="text-white data-[state=active]:bg-white/20">Third-party Apps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Integration Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1">
                    Connect your email to automatically track job applications
                  </p>
                  <Badge className={isConnected ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <Button
                  onClick={handleConnect}
                  className={isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
                >
                  {isConnected ? 'Disconnect' : 'Connect Email'}
                </Button>
              </div>

              {isConnected && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center text-green-300 text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Email integration active. Scanning emails for job updates.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="h-5 w-5 mr-2" />
                API Connections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Connect your email providers through APIs for seamless integration
              </p>
              
              <div className="space-y-3">
                {apiConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">{connection.name}</p>
                        <p className="text-gray-400 text-xs">{connection.type.toUpperCase()} Protocol</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={
                        connection.status === 'connected' ? 'bg-green-500/20 text-green-300' :
                        connection.status === 'error' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                      }>
                        {connection.status}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleAPIConnect(connection.id)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                      >
                        {connection.status === 'connected' ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-medium mb-3">Custom IMAP/POP3 Setup</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Server</Label>
                    <Input
                      value={imapSettings.server}
                      onChange={(e) => setImapSettings({...imapSettings, server: e.target.value})}
                      placeholder="imap.example.com"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Port</Label>
                    <Input
                      value={imapSettings.port}
                      onChange={(e) => setImapSettings({...imapSettings, port: e.target.value})}
                      placeholder="993"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Username</Label>
                    <Input
                      value={imapSettings.username}
                      onChange={(e) => setImapSettings({...imapSettings, username: e.target.value})}
                      placeholder="user@example.com"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Password</Label>
                    <Input
                      type="password"
                      value={imapSettings.password}
                      onChange={(e) => setImapSettings({...imapSettings, password: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <Button className="mt-4 bg-blue-500 hover:bg-blue-600">
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Smart Email Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Configure how JobTrail should respond to different email keywords
              </p>
              
              <div className="space-y-3">
                {emailRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          "{rule.keyword}"
                        </Badge>
                        {rule.targetStatus && (
                          <Badge className="text-xs bg-blue-500/20 text-blue-300">
                            → {rule.targetStatus}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {rule.action === 'update_status' ? 'Updates job status' : 
                         rule.action === 'create_reminder' ? 'Creates reminder' : 'Adds note'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {rule.enabled ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full border-white/20 text-gray-300">
                <Settings className="h-4 w-4 mr-2" />
                Customize Rules
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apps" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                Third-party App Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                Connect with popular apps and services for enhanced job tracking
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Calendar Apps</h4>
                  <p className="text-gray-400 text-sm mb-3">Sync interview dates and reminders</p>
                  <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-300">
                    Connect Google Calendar
                  </Button>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">CRM Systems</h4>
                  <p className="text-gray-400 text-sm mb-3">Manage contacts and relationships</p>
                  <Button size="sm" className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300">
                    Connect Salesforce
                  </Button>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Note-taking Apps</h4>
                  <p className="text-gray-400 text-sm mb-3">Save and organize job notes</p>
                  <Button size="sm" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300">
                    Connect Notion
                  </Button>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Communication</h4>
                  <p className="text-gray-400 text-sm mb-3">Track messages and calls</p>
                  <Button size="sm" className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300">
                    Connect Slack
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center text-yellow-300 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <div>
                    <p className="font-medium">Permission Management</p>
                    <p className="text-xs text-yellow-400 mt-1">
                      You can grant and revoke permissions for third-party apps to access your email data at any time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

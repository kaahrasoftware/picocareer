
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Send, Key, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  content: string;
  message_type: 'user' | 'bot';
  created_at: string;
}

interface ChatSession {
  id: string;
  status: string;
  created_at: string;
}

export function ApiDemo() {
  const [apiKey, setApiKey] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();

  const API_BASE_URL = `${window.location.origin}/supabase/functions/v1`;

  const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API call failed');
    }

    return response.json();
  };

  const createSession = async () => {
    try {
      setLoading(true);
      const result = await makeApiCall('/org-api/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({
          user_id: 'demo-user-' + Date.now(),
          metadata: { source: 'api_demo' }
        }),
      });
      
      setSessionId(result.data.id);
      setMessages([]);
      toast({
        title: "Session Created",
        description: `New chat session: ${result.data.id}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!sessionId || !message.trim()) return;

    try {
      setLoading(true);
      await makeApiCall(`/org-api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: message.trim() }),
      });

      // Fetch updated messages
      const messagesResult = await makeApiCall(`/org-api/chat/sessions/${sessionId}/messages`);
      setMessages(messagesResult.data);
      setMessage('');
      
      toast({
        title: "Message Sent",
        description: "AI response generated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchCareers = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const result = await makeApiCall(`/org-api/careers/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      setSearchResults(result.data);
      
      toast({
        title: "Search Complete",
        description: `Found ${result.data.length} careers`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organization API Demo</h1>
        <p className="text-muted-foreground">
          Test our API endpoints for integrating career guidance into your applications
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Authentication
          </CardTitle>
          <CardDescription>
            Enter your organization's API key to test the endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="sk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Badge variant={apiKey ? "default" : "secondary"}>
              {apiKey ? "Key Set" : "No Key"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Career Chat API</TabsTrigger>
          <TabsTrigger value="search">Career Search API</TabsTrigger>
          <TabsTrigger value="analytics">Analytics API</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Career Chat Integration</CardTitle>
              <CardDescription>
                Create chat sessions and send messages to our AI career advisor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={createSession} 
                  disabled={!apiKey || loading}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Create New Session
                </Button>
                {sessionId && (
                  <Badge variant="outline">Session: {sessionId.slice(0, 8)}...</Badge>
                )}
              </div>

              {sessionId && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-muted/50">
                    {messages.length === 0 ? (
                      <p className="text-muted-foreground">No messages yet. Send a message to start the conversation.</p>
                    ) : (
                      messages.map((msg, idx) => (
                        <div key={idx} className={`mb-2 p-2 rounded ${
                          msg.message_type === 'user' 
                            ? 'bg-blue-100 ml-8' 
                            : 'bg-gray-100 mr-8'
                        }`}>
                          <div className="font-semibold text-sm mb-1">
                            {msg.message_type === 'user' ? 'User' : 'AI Assistant'}
                          </div>
                          <div>{msg.content}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!message.trim() || loading}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Example Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// Create a new chat session
const session = await fetch('/supabase/functions/v1/org-api/chat/sessions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'your-user-id',
    metadata: { source: 'your-app' }
  })
});

// Send a message
const response = await fetch(\`/supabase/functions/v1/org-api/chat/sessions/\${sessionId}/messages\`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: 'I want to explore tech careers' })
});`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Career Search API</CardTitle>
              <CardDescription>
                Search our database of careers with filters and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search careers (e.g., 'software engineer', 'healthcare')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCareers()}
                  className="flex-1"
                />
                <Button 
                  onClick={searchCareers} 
                  disabled={!apiKey || !searchQuery.trim() || loading}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {searchResults.map((career) => (
                    <div key={career.id} className="border rounded-lg p-3">
                      <h3 className="font-semibold">{career.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {career.description?.slice(0, 150)}...
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {career.industry && (
                          <Badge variant="secondary">{career.industry}</Badge>
                        )}
                        {career.salary_range && (
                          <Badge variant="outline">{career.salary_range}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Example Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// Search careers
const careers = await fetch('/supabase/functions/v1/org-api/careers/search?q=engineer&industry=technology&limit=20', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await careers.json();
console.log(data.data); // Array of career objects`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics API
              </CardTitle>
              <CardDescription>
                Get insights about your organization's API usage and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard will show usage metrics, popular features, and user engagement data.</p>
                <p className="text-sm mt-2">Available with authenticated API key.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Example Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// Get analytics data
const analytics = await fetch('/supabase/functions/v1/org-api/analytics?start_date=2024-01-01&end_date=2024-01-31', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await analytics.json();
// Returns: { total_sessions, total_messages, api_calls, period }`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

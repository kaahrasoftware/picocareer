import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Play, Copy, ExternalLink } from "lucide-react";
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute";

export default function APITesting() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const testCreateSession = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('api-assessments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          external_user_id: `test_user_${Date.now()}`,
          client_metadata: {
            source: 'api_testing_page',
            test_run: true
          }
        }
      });

      if (error) throw error;

      setSessionToken(data.session_token);
      setTestResults(data);
      
      toast({
        title: "Success",
        description: "Assessment session created successfully",
      });
    } catch (error) {
      console.error('Test create session error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetSession = async () => {
    if (!apiKey || !sessionToken) {
      toast({
        title: "Error",
        description: "Please enter API key and create a session first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(`api-assessments/${sessionToken}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });

      if (error) throw error;

      setTestResults(data);
      
      toast({
        title: "Success",
        description: "Session data retrieved successfully",
      });
    } catch (error) {
      console.error('Test get session error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSubmitResponse = async () => {
    if (!apiKey || !sessionToken) {
      toast({
        title: "Error",
        description: "Please enter API key and create a session first",
        variant: "destructive",
      });
      return;
    }

    if (!testResults?.questions?.[0]?.id) {
      toast({
        title: "Error",
        description: "No questions available. Get session data first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(`api-assessments/${sessionToken}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          question_id: testResults.questions[0].id,
          answer: "Sample test answer"
        }
      });

      if (error) throw error;

      setTestResults(prev => ({ ...prev, last_response: data }));
      
      toast({
        title: "Success",
        description: "Response submitted successfully",
      });
    } catch (error) {
      console.error('Test submit response error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetResults = async () => {
    if (!apiKey || !sessionToken) {
      toast({
        title: "Error",
        description: "Please enter API key and create a session first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const sessionId = testResults?.session_id;
      if (!sessionId) {
        throw new Error("No session ID available");
      }

      const { data, error } = await supabase.functions.invoke(`api-results/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });

      if (error) throw error;

      setTestResults(prev => ({ ...prev, results: data }));
      
      toast({
        title: "Success",
        description: "Results retrieved successfully",
      });
    } catch (error) {
      console.error('Test get results error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetAnalytics = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('api-results/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });

      if (error) throw error;

      setTestResults(prev => ({ ...prev, analytics: data }));
      
      toast({
        title: "Success",
        description: "Analytics retrieved successfully",
      });
    } catch (error) {
      console.error('Test get analytics error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Testing</h1>
            <p className="text-muted-foreground">
              Test the consumer-facing APIs for assessment integration
            </p>
          </div>
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="assessments">Assessments API</TabsTrigger>
            <TabsTrigger value="results">Results API</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Key Configuration</CardTitle>
                <CardDescription>
                  Enter your API key to test the consumer APIs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="pk_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Create an API key in the API Keys tab first
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Current Session Token</Label>
                  <div className="flex gap-2">
                    <Input
                      value={sessionToken}
                      placeholder="Generated after creating a session"
                      readOnly
                      className="font-mono text-sm"
                    />
                    {sessionToken && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(sessionToken)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {apiKey && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Badge variant="secondary">Ready to test</Badge>
                    <p className="text-sm mt-2">
                      You can now test the API endpoints in the other tabs
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment API Testing</CardTitle>
                <CardDescription>
                  Test session creation, question delivery, and response collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={testCreateSession} disabled={loading || !apiKey}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Create Session
                  </Button>
                  
                  <Button onClick={testGetSession} disabled={loading || !sessionToken}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Get Session
                  </Button>

                  <Button onClick={testSubmitResponse} disabled={loading || !sessionToken}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Submit Response
                  </Button>

                  <Button onClick={testGetResults} disabled={loading || !sessionToken}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Get Results
                  </Button>
                </div>

                {testResults && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Test Results</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(testResults, null, 2))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy JSON
                      </Button>
                    </div>
                    <Textarea
                      value={JSON.stringify(testResults, null, 2)}
                      readOnly
                      className="font-mono text-sm min-h-[300px]"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Results & Analytics API Testing</CardTitle>
                <CardDescription>
                  Test results retrieval and analytics endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={testGetAnalytics} disabled={loading || !apiKey}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Get Analytics
                  </Button>
                  
                  <Button 
                    onClick={testGetResults} 
                    disabled={loading || !sessionToken}
                    variant="outline"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Get Session Results
                  </Button>
                </div>

                {testResults?.analytics && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Analytics Results</h3>
                    <Textarea
                      value={JSON.stringify(testResults.analytics, null, 2)}
                      readOnly
                      className="font-mono text-sm min-h-[200px]"
                    />
                  </div>
                )}

                {testResults?.results && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Session Results</h3>
                    <Textarea
                      value={JSON.stringify(testResults.results, null, 2)}
                      readOnly
                      className="font-mono text-sm min-h-[200px]"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Examples</CardTitle>
                <CardDescription>
                  Code examples for integrating with the APIs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">JavaScript/Node.js Example</h3>
                  <Textarea
                    value={`// Create assessment session
const response = await fetch('https://60de3a54-651c-47c9-8f0e-6fe1e50a6566.supabase.co/functions/v1/api-assessments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    external_user_id: 'user123',
    client_metadata: { source: 'website' }
  })
});

const session = await response.json();
console.log('Session created:', session);

// Get questions
const questionsResponse = await fetch(\`https://60de3a54-651c-47c9-8f0e-6fe1e50a6566.supabase.co/functions/v1/api-assessments/\${session.session_token}\`, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});

const questions = await questionsResponse.json();
console.log('Questions:', questions);

// Submit response
const submitResponse = await fetch(\`https://60de3a54-651c-47c9-8f0e-6fe1e50a6566.supabase.co/functions/v1/api-assessments/\${session.session_token}\`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question_id: questions.questions[0].id,
    answer: 'User answer here'
  })
});

// Get results
const resultsResponse = await fetch(\`https://60de3a54-651c-47c9-8f0e-6fe1e50a6566.supabase.co/functions/v1/api-results/\${session.session_id}\`, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});

const results = await resultsResponse.json();
console.log('Results:', results);`}
                    readOnly
                    className="font-mono text-sm min-h-[300px]"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(`// Create assessment session
const response = await fetch('https://60de3a54-651c-47c9-8f0e-6fe1e50a6566.supabase.co/functions/v1/api-assessments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    external_user_id: 'user123',
    client_metadata: { source: 'website' }
  })
});

const session = await response.json();
console.log('Session created:', session);`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Example
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">API Endpoints</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">POST</Badge>
                      <code className="text-sm">/api-assessments</code>
                      <span className="text-sm text-muted-foreground">Create session</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">GET</Badge>
                      <code className="text-sm">/api-assessments/:token</code>
                      <span className="text-sm text-muted-foreground">Get questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">POST</Badge>
                      <code className="text-sm">/api-assessments/:token</code>
                      <span className="text-sm text-muted-foreground">Submit response</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">GET</Badge>
                      <code className="text-sm">/api-results/:sessionId</code>
                      <span className="text-sm text-muted-foreground">Get results</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">GET</Badge>
                      <code className="text-sm">/api-results/analytics</code>
                      <span className="text-sm text-muted-foreground">Get analytics</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedAdminRoute>
  );
}
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Code, BookOpen, Zap, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute";

export default function APIDocs() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully",
    });
  };

  const SDKExamples = {
    installation: `npm install @picocareer/sdk
# or
yarn add @picocareer/sdk`,
    
    quickStart: `import { PicoCareerSDK } from '@picocareer/sdk';

const sdk = new PicoCareerSDK({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://wurdmlkfkzuivvwxjmxk.supabase.co/functions/v1'
});

// Create a new assessment session
const session = await sdk.createSession({
  externalUserId: 'user-123',
  returnUrl: 'https://yourapp.com/assessment-complete',
  webhookUrl: 'https://yourapp.com/webhooks/assessment'
});

console.log('Assessment URL:', session.assessmentUrl);`,

    sessionManagement: `// Create a session with custom template
const session = await sdk.createSession({
  externalUserId: 'user-456',
  templateId: 'custom-template-id',
  clientMetadata: {
    userType: 'student',
    source: 'career-portal'
  },
  expiresInMinutes: 120
});

// Get session details
const sessionInfo = await sdk.getSession(session.id);

// Get assessment questions
const questions = await sdk.getQuestions(session.sessionToken);`,

    responseSubmission: `// Submit individual responses
await sdk.submitResponse(sessionToken, [
  {
    questionId: 'q1',
    answer: { selectedOptions: ['option1', 'option3'] }
  },
  {
    questionId: 'q2', 
    answer: { rating: 4 }
  }
]);

// Complete the assessment
const completion = await sdk.completeAssessment(sessionToken);`,

    resultsRetrieval: `// Get results for a specific session
const results = await sdk.getResults(sessionId);

console.log('Career recommendations:', results.recommendations);
console.log('Profile type:', results.profileType);

// Get all results with filtering
const allResults = await sdk.getAllResults({
  limit: 50,
  status: 'completed',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});`,

    analytics: `// Get organization analytics
const analytics = await sdk.getAnalytics({
  period: 'monthly',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

console.log('Completion rate:', analytics.completionRate);
console.log('Top careers:', analytics.topCareers);`,

    webhooks: `import { PicoCareerSDK } from '@picocareer/sdk';

// Validate webhook signature
const isValid = PicoCareerSDK.validateWebhookSignature(
  requestBody,
  headers['x-picocareer-signature'],
  'your-webhook-secret'
);

if (isValid) {
  const event = PicoCareerSDK.parseWebhookEvent(requestBody);
  
  switch (event.eventType) {
    case 'session.started':
      console.log('Assessment started:', event.sessionId);
      break;
    case 'results.ready':
      console.log('Results available:', event.data);
      break;
  }
}`,

    errorHandling: `import { PicoCareerSDK, PicoCareerSDKError } from '@picocareer/sdk';

try {
  const session = await sdk.createSession(params);
} catch (error) {
  if (error instanceof PicoCareerSDKError) {
    console.error('SDK Error:', error.code, error.message);
    console.error('Status:', error.statusCode);
    console.error('Details:', error.details);
  } else {
    console.error('Unknown error:', error);
  }
}`
  };

  const APIReference = [
    {
      method: "POST",
      endpoint: "/api-assessments",
      description: "Create a new assessment session",
      parameters: [
        { name: "external_user_id", type: "string", required: true, description: "Unique identifier for the user" },
        { name: "template_id", type: "string", required: false, description: "Assessment template to use" },
        { name: "return_url", type: "string", required: false, description: "URL to redirect after completion" },
        { name: "webhook_url", type: "string", required: false, description: "URL for webhook notifications" },
      ]
    },
    {
      method: "GET",
      endpoint: "/api-assessments/{session_id}",
      description: "Get session details",
      parameters: [
        { name: "session_id", type: "string", required: true, description: "Session identifier" }
      ]
    },
    {
      method: "GET",
      endpoint: "/api-results/{session_id}",
      description: "Get assessment results",
      parameters: [
        { name: "session_id", type: "string", required: true, description: "Session identifier" }
      ]
    }
  ];

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Documentation</h1>
            <p className="text-muted-foreground">
              Comprehensive guide for integrating PicoCareer assessments
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="quickstart" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="sdk" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              SDK Guide
            </TabsTrigger>
            <TabsTrigger value="api-reference" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              API Reference
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Examples
            </TabsTrigger>
            <TabsTrigger value="error-handling" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Error Handling
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    RESTful API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Simple, well-documented REST endpoints for assessment creation and results retrieval.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    JavaScript SDK
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    TypeScript-first SDK with comprehensive error handling and retry logic.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Secure & Reliable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    API key authentication, rate limiting, and webhook signature validation.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>All API requests require authentication using API keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    Authorization: Bearer your-api-key-here
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Authorization: Bearer your-api-key-here")}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  API keys can be generated and managed in the API Administration panel.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>API usage is subject to rate limiting based on your subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">60</div>
                    <div className="text-sm text-muted-foreground">Requests per minute</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">1,000</div>
                    <div className="text-sm text-muted-foreground">Requests per day</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">100</div>
                    <div className="text-sm text-muted-foreground">Assessments per month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quickstart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Installation</CardTitle>
                <CardDescription>Install the PicoCareer SDK</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{SDKExamples.installation}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(SDKExamples.installation)}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Initialize SDK</CardTitle>
                <CardDescription>Set up the SDK with your API key</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{SDKExamples.quickStart}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(SDKExamples.quickStart)}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Integration Flow</CardTitle>
                <CardDescription>Typical assessment integration workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">1</Badge>
                    <span>Create assessment session for user</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">2</Badge>
                    <span>Redirect user to assessment URL</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">3</Badge>
                    <span>Receive webhook notification when complete</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">4</Badge>
                    <span>Fetch and display results</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sdk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>Create and manage assessment sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{SDKExamples.sessionManagement}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(SDKExamples.sessionManagement)}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Submission</CardTitle>
                <CardDescription>Submit assessment responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{SDKExamples.responseSubmission}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(SDKExamples.responseSubmission)}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results Retrieval</CardTitle>
                <CardDescription>Get assessment results and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{SDKExamples.resultsRetrieval}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(SDKExamples.resultsRetrieval)}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Get organization-level analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{SDKExamples.analytics}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(SDKExamples.analytics)}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-reference" className="space-y-6">
            {APIReference.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm">{endpoint.endpoint}</code>
                  </CardTitle>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Parameters</h4>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-center gap-2 p-2 border rounded">
                            <code className="text-sm">{param.name}</code>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            <span className="text-sm text-muted-foreground">{param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Events</CardTitle>
                <CardDescription>Real-time notifications for assessment events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold">session.started</div>
                      <div className="text-sm text-muted-foreground">When a user begins an assessment</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold">response.submitted</div>
                      <div className="text-sm text-muted-foreground">When responses are saved</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold">session.completed</div>
                      <div className="text-sm text-muted-foreground">When assessment is finished</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold">results.ready</div>
                      <div className="text-sm text-muted-foreground">When results are processed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Handling</CardTitle>
                <CardDescription>Validate and process webhook events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{SDKExamples.webhooks}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(SDKExamples.webhooks)}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>React Integration Example</CardTitle>
                <CardDescription>Complete React component for assessment integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`import React, { useState } from 'react';
import { PicoCareerSDK } from '@picocareer/sdk';

const AssessmentComponent = ({ userId, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [sessionUrl, setSessionUrl] = useState(null);

  const sdk = new PicoCareerSDK({
    apiKey: process.env.REACT_APP_PICOCAREER_API_KEY
  });

  const startAssessment = async () => {
    setLoading(true);
    try {
      const session = await sdk.createSession({
        externalUserId: userId,
        returnUrl: window.location.origin + '/assessment-complete',
        webhookUrl: process.env.REACT_APP_WEBHOOK_URL
      });
      setSessionUrl(session.assessmentUrl);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (sessionUrl) {
    return (
      <iframe
        src={sessionUrl}
        width="100%"
        height="600px"
        frameBorder="0"
      />
    );
  }

  return (
    <button onClick={startAssessment} disabled={loading}>
      {loading ? 'Starting Assessment...' : 'Begin Career Assessment'}
    </button>
  );
};`}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("React example copied")}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Node.js Webhook Endpoint</CardTitle>
                <CardDescription>Express.js webhook receiver example</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`const express = require('express');
const { PicoCareerSDK } = require('@picocareer/sdk');

const app = express();
app.use(express.raw({ type: 'application/json' }));

app.post('/webhooks/assessment', (req, res) => {
  const signature = req.headers['x-picocareer-signature'];
  const payload = req.body.toString();

  const isValid = PicoCareerSDK.validateWebhookSignature(
    payload,
    signature,
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = PicoCareerSDK.parseWebhookEvent(payload);
  
  switch (event.eventType) {
    case 'results.ready':
      // Process completed assessment
      console.log('Assessment completed:', event.sessionId);
      // Update user record, send notifications, etc.
      break;
  }

  res.status(200).send('OK');
});`}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Node.js example copied")}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="error-handling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Handling</CardTitle>
                <CardDescription>Comprehensive error handling with the SDK</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{SDKExamples.errorHandling}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(SDKExamples.errorHandling)}
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Error Codes</CardTitle>
                <CardDescription>Understanding API error responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <Badge variant="destructive">AUTH_ERROR</Badge>
                    <span className="text-sm">Invalid or missing API key</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <Badge variant="destructive">RATE_LIMIT_EXCEEDED</Badge>
                    <span className="text-sm">Too many requests</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <Badge variant="destructive">INVALID_SESSION_TOKEN</Badge>
                    <span className="text-sm">Session token expired or invalid</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <Badge variant="destructive">QUOTA_EXCEEDED</Badge>
                    <span className="text-sm">Monthly assessment quota reached</span>
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
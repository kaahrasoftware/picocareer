import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CodeIcon, Copy, ExternalLink, Lightbulb, Monitor, Smartphone, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const integrationExamples = {
  react: {
    name: "React Widget",
    description: "Embed assessments directly in React applications",
    code: `import { PicoCareerWidget } from '@picocareer/react-widget';

function MyComponent() {
  const handleComplete = (results) => {
    console.log('Assessment completed:', results);
    // Handle results...
  };

  return (
    <PicoCareerWidget
      apiKey="your-api-key"
      templateId="template-123"
      onComplete={handleComplete}
      theme={{
        primaryColor: "#00A6D4",
        borderRadius: "8px"
      }}
      config={{
        showProgress: true,
        allowRetries: false
      }}
    />
  );
}`,
    dependencies: ["@picocareer/react-widget", "react", "react-dom"]
  },
  javascript: {
    name: "Vanilla JavaScript",
    description: "Pure JavaScript integration for any website",
    code: `// Initialize PicoCareer SDK
const picoCareer = new PicoCareerSDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://wurdmlkfkzuivvwxjmxk.supabase.co/functions/v1'
});

// Create assessment session
async function startAssessment() {
  try {
    const session = await picoCareer.createSession({
      externalUserId: 'user-123',
      templateId: 'template-456',
      returnUrl: 'https://yoursite.com/results',
      webhookUrl: 'https://yoursite.com/webhook'
    });
    
    console.log('Session created:', session);
    
    // Redirect user to assessment
    window.location.href = \`https://yoursite.com/assessment/\${session.sessionToken}\`;
  } catch (error) {
    console.error('Failed to create session:', error);
  }
}

// Handle webhook events
app.post('/webhook', (req, res) => {
  const event = req.body;
  
  switch (event.eventType) {
    case 'session.completed':
      console.log('Assessment completed:', event.data);
      // Process results...
      break;
    case 'results.ready':
      console.log('Results available:', event.data);
      // Notify user...
      break;
  }
  
  res.status(200).send('OK');
});`,
    dependencies: ["@picocareer/js-sdk"]
  },
  nextjs: {
    name: "Next.js Integration",
    description: "Server-side rendering with Next.js",
    code: `// pages/api/assessment/create.js
import { PicoCareerSDK } from '@picocareer/node-sdk';

const picoCareer = new PicoCareerSDK({
  apiKey: process.env.PICOCAREER_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, templateId } = req.body;
    
    const session = await picoCareer.createSession({
      externalUserId: userId,
      templateId: templateId,
      callbackUrl: \`\${process.env.NEXT_PUBLIC_BASE_URL}/assessment/callback\`,
      webhookUrl: \`\${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/assessment\`
    });

    res.status(200).json({ sessionId: session.id, token: session.sessionToken });
  } catch (error) {
    console.error('Assessment creation failed:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
}

// pages/assessment/[token].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AssessmentPage() {
  const router = useRouter();
  const { token } = router.query;
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (token) {
      fetchQuestions(token);
    }
  }, [token]);

  const fetchQuestions = async (sessionToken) => {
    try {
      const response = await fetch(\`/api/assessment/questions?token=\${sessionToken}\`);
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Career Assessment</h1>
      {/* Render questions... */}
    </div>
  );
}`,
    dependencies: ["@picocareer/node-sdk", "next", "react", "react-dom"]
  },
  webhook: {
    name: "Webhook Handler",
    description: "Handle assessment events and results",
    code: `const express = require('express');
const crypto = require('crypto');
const { PicoCareerSDK } = require('@picocareer/node-sdk');

const app = express();
app.use(express.json());

const picoCareer = new PicoCareerSDK({
  apiKey: process.env.PICOCAREER_API_KEY
});

// Webhook signature verification
function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Webhook endpoint
app.post('/webhooks/picocareer', (req, res) => {
  const signature = req.headers['x-picocareer-signature'];
  const payload = JSON.stringify(req.body);
  
  // Verify signature
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Unauthorized');
  }
  
  const event = req.body;
  
  switch (event.eventType) {
    case 'session.started':
      console.log('Assessment started:', event.sessionId);
      // Track analytics...
      break;
      
    case 'session.completed':
      console.log('Assessment completed:', event.sessionId);
      // Fetch results and process...
      handleAssessmentCompletion(event);
      break;
      
    case 'response.submitted':
      console.log('Response submitted:', event.data);
      // Save progress...
      break;
      
    case 'results.ready':
      console.log('Results ready:', event.sessionId);
      // Notify user via email/SMS...
      notifyUserResults(event);
      break;
  }
  
  res.status(200).send('OK');
});

async function handleAssessmentCompletion(event) {
  try {
    const results = await picoCareer.getResults(event.sessionId);
    
    // Save to database
    await saveResultsToDatabase(results);
    
    // Send completion email
    await sendCompletionEmail(event.data.userEmail, results);
    
    // Trigger any follow-up actions
    await triggerFollowUpActions(results);
  } catch (error) {
    console.error('Error handling completion:', error);
  }
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});`,
    dependencies: ["@picocareer/node-sdk", "express", "crypto"]
  }
};

const platformExamples = [
  {
    platform: "Mobile App",
    icon: Smartphone,
    description: "React Native integration for mobile apps",
    features: ["Offline support", "Push notifications", "Native UI components"]
  },
  {
    platform: "Web Dashboard",
    icon: Monitor,
    description: "Admin dashboard for managing assessments",
    features: ["Real-time analytics", "User management", "Custom branding"]
  },
  {
    platform: "API Integration",
    icon: Code2,
    description: "Direct API integration for custom solutions",
    features: ["RESTful endpoints", "Webhook events", "Rate limiting"]
  }
];

export function IntegrationDemos() {
  const [selectedExample, setSelectedExample] = useState('react');
  const [previewMode, setPreviewMode] = useState('desktop');
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const currentExample = integrationExamples[selectedExample as keyof typeof integrationExamples];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Integration Examples & Demos</h3>
          <p className="text-sm text-muted-foreground">
            Ready-to-use code examples and live demos for different platforms
          </p>
        </div>
      </div>

      <Tabs defaultValue="code-examples" className="space-y-6">
        <TabsList>
          <TabsTrigger value="code-examples">Code Examples</TabsTrigger>
          <TabsTrigger value="live-demo">Live Demo</TabsTrigger>
          <TabsTrigger value="platforms">Platform Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="code-examples" className="space-y-4">
          <div className="flex space-x-4 mb-4">
            {Object.entries(integrationExamples).map(([key, example]) => (
              <Button
                key={key}
                variant={selectedExample === key ? "default" : "outline"}
                onClick={() => setSelectedExample(key)}
                className="flex items-center space-x-2"
              >
                <CodeIcon className="h-4 w-4" />
                <span>{example.name}</span>
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <CodeIcon className="h-5 w-5" />
                    <span>{currentExample.name}</span>
                  </CardTitle>
                  <CardDescription>{currentExample.description}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(currentExample.code)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium">Dependencies:</span>
                  {currentExample.dependencies.map((dep) => (
                    <Badge key={dep} variant="secondary">
                      {dep}
                    </Badge>
                  ))}
                </div>
                
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{currentExample.code}</code>
                  </pre>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Example
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live CodePen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-demo" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium">Interactive Assessment Demo</h4>
            <div className="flex space-x-2">
              <Button
                variant={previewMode === 'desktop' ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={previewMode === 'mobile' ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className={`border rounded-lg bg-white ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                <div className="p-6 space-y-6">
                  {/* Demo Assessment UI */}
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-primary">Career Assessment Demo</h2>
                    <p className="text-muted-foreground">
                      This is a live preview of how the assessment appears to users
                    </p>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Which work environment appeals to you most?
                      </h3>
                      <div className="space-y-2">
                        {[
                          "Collaborative team environment with frequent meetings",
                          "Independent work with minimal supervision",
                          "Mix of individual and team-based projects",
                          "Dynamic environment with changing priorities"
                        ].map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                            <input type="radio" name="demo-question" className="text-primary" />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline">Previous</Button>
                      <Button>Next Question</Button>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Question 3 of 10 • Estimated time: 5 minutes remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Customization Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input type="color" value="#00A6D4" className="w-12 h-10" />
                    <Input value="#00A6D4" readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select defaultValue="8px">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0px">0px (Square)</SelectItem>
                      <SelectItem value="4px">4px (Subtle)</SelectItem>
                      <SelectItem value="8px">8px (Default)</SelectItem>
                      <SelectItem value="12px">12px (Rounded)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Question Layout</Label>
                  <Select defaultValue="vertical">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vertical">Vertical Stack</SelectItem>
                      <SelectItem value="horizontal">Horizontal Grid</SelectItem>
                      <SelectItem value="cards">Card Layout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Progress Style</Label>
                  <Select defaultValue="bar">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Progress Bar</SelectItem>
                      <SelectItem value="steps">Step Indicator</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="none">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformExamples.map((platform, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <platform.icon className="h-5 w-5" />
                    <span>{platform.platform}</span>
                  </CardTitle>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Key Features:</span>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {platform.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Guide
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <CodeIcon className="h-4 w-4 mr-2" />
                        Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>SDK Installation</CardTitle>
              <CardDescription>
                Quick start guide for different platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="npm" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="npm">npm</TabsTrigger>
                  <TabsTrigger value="yarn">Yarn</TabsTrigger>
                  <TabsTrigger value="cdn">CDN</TabsTrigger>
                </TabsList>

                <TabsContent value="npm">
                  <div className="space-y-2">
                    <Label>Install the SDK</Label>
                    <div className="flex space-x-2">
                      <Input
                        value="npm install @picocareer/js-sdk"
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard("npm install @picocareer/js-sdk")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="yarn">
                  <div className="space-y-2">
                    <Label>Install the SDK</Label>
                    <div className="flex space-x-2">
                      <Input
                        value="yarn add @picocareer/js-sdk"
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard("yarn add @picocareer/js-sdk")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cdn">
                  <div className="space-y-2">
                    <Label>Include via CDN</Label>
                    <div className="flex space-x-2">
                      <Input
                        value='<script src="https://cdn.picocareer.com/sdk/v1/picocareer.min.js"></script>'
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard('<script src="https://cdn.picocareer.com/sdk/v1/picocareer.min.js"></script>')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
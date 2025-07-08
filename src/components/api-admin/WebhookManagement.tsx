import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Webhook, Send, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebhookEvent {
  id: string;
  eventType: string;
  sessionId: string;
  organizationId: string;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  lastAttempt: string;
  nextRetry?: string;
  webhookUrl: string;
  responseCode?: number;
  errorMessage?: string;
  createdAt: string;
}

interface WebhookEndpoint {
  id: string;
  organizationId: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastDelivery?: string;
  createdAt: string;
}

export function WebhookManagement() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUrl, setTestUrl] = useState("");
  const [testEvent, setTestEvent] = useState("session.started");
  const { toast } = useToast();

  useEffect(() => {
    loadWebhookData();
  }, []);

  const loadWebhookData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setEvents([
        {
          id: "1",
          eventType: "session.started",
          sessionId: "sess_123",
          organizationId: "org_456",
          status: "delivered",
          attempts: 1,
          lastAttempt: "2024-01-08T10:30:00Z",
          webhookUrl: "https://example.com/webhooks",
          responseCode: 200,
          createdAt: "2024-01-08T10:30:00Z"
        },
        {
          id: "2",
          eventType: "results.ready",
          sessionId: "sess_124",
          organizationId: "org_456",
          status: "failed",
          attempts: 3,
          lastAttempt: "2024-01-08T11:00:00Z",
          nextRetry: "2024-01-08T11:15:00Z",
          webhookUrl: "https://example.com/webhooks",
          responseCode: 500,
          errorMessage: "Internal Server Error",
          createdAt: "2024-01-08T10:45:00Z"
        }
      ]);

      setEndpoints([
        {
          id: "1",
          organizationId: "org_456",
          url: "https://example.com/webhooks",
          events: ["session.started", "results.ready"],
          isActive: true,
          secret: "whsec_abc123...",
          lastDelivery: "2024-01-08T10:30:00Z",
          createdAt: "2024-01-08T09:00:00Z"
        }
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load webhook data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const retryWebhook = async (eventId: string) => {
    try {
      toast({
        title: "Webhook Retry",
        description: "Webhook event queued for retry",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry webhook",
        variant: "destructive",
      });
    }
  };

  const testWebhook = async () => {
    if (!testUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Mock test webhook
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Webhook Test Successful",
        description: "Test webhook delivered successfully",
      });
    } catch (error) {
      toast({
        title: "Webhook Test Failed",
        description: "Failed to deliver test webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'retrying':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      delivered: "default",
      failed: "destructive",
      retrying: "secondary",
      pending: "outline"
    };
    
    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhook Management</h2>
          <p className="text-muted-foreground">
            Monitor webhook deliveries and manage endpoints
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Event History</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Recent Webhook Events
              </CardTitle>
              <CardDescription>
                Monitor webhook delivery status and retry failed events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Last Attempt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge variant="outline">{event.eventType}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{event.sessionId}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">{event.webhookUrl}</TableCell>
                      <TableCell>
                        <span className={event.attempts > 1 ? "text-yellow-600" : ""}>
                          {event.attempts}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(event.lastAttempt).toLocaleString()}</TableCell>
                      <TableCell>
                        {event.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryWebhook(event.id)}
                          >
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Endpoints</CardTitle>
              <CardDescription>
                Manage webhook endpoints for your organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Delivery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.map((endpoint) => (
                    <TableRow key={endpoint.id}>
                      <TableCell className="font-mono text-sm">{endpoint.url}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {endpoint.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={endpoint.isActive ? "default" : "secondary"}>
                          {endpoint.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {endpoint.lastDelivery ? 
                          new Date(endpoint.lastDelivery).toLocaleString() : 
                          "Never"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Test
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Webhook Testing Tool
              </CardTitle>
              <CardDescription>
                Test webhook delivery to your endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-url">Webhook URL</Label>
                  <Input
                    id="test-url"
                    placeholder="https://yourapp.com/webhooks"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-event">Event Type</Label>
                  <Select value={testEvent} onValueChange={setTestEvent}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="session.started">session.started</SelectItem>
                      <SelectItem value="response.submitted">response.submitted</SelectItem>
                      <SelectItem value="session.completed">session.completed</SelectItem>
                      <SelectItem value="results.ready">results.ready</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Test Payload Preview</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{JSON.stringify({
                        eventType: testEvent,
                        sessionId: "test_session_" + Date.now(),
                        organizationId: "org_test",
                        timestamp: new Date().toISOString(),
                        data: {
                          message: "This is a test webhook event"
                        }
                      }, null, 2)}</code>
                    </pre>
                  </div>
                </div>

                <Button 
                  onClick={testWebhook} 
                  disabled={loading || !testUrl}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Test Webhook"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Signature Validation</CardTitle>
              <CardDescription>
                How to validate webhook signatures in your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`// Node.js Express example
const crypto = require('crypto');

app.post('/webhooks', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-picocareer-signature'];
  const payload = req.body;
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature === expectedSignature) {
    // Process webhook
    const event = JSON.parse(payload);
    console.log('Received event:', event.eventType);
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});`}</code>
                  </pre>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>The webhook signature is sent in the <code>x-picocareer-signature</code> header.</p>
                  <p>Use your webhook secret to validate the HMAC SHA-256 signature.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  Download, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkOperation {
  id: string;
  type: 'create_sessions' | 'send_invites' | 'export_results' | 'update_users' | 'delete_sessions';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  results?: any;
}

interface BulkUser {
  externalUserId: string;
  email: string;
  metadata?: Record<string, any>;
  templateId?: string;
  callbackUrl?: string;
}

export function BulkManagement() {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [uploadData, setUploadData] = useState<BulkUser[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [bulkCallbackUrl, setBulkCallbackUrl] = useState('');
  const [exportFilters, setExportFilters] = useState({
    dateRange: 'last_30_days',
    status: 'all',
    organizationId: ''
  });
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const data: BulkUser[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= 2) {
              data.push({
                externalUserId: values[headers.indexOf('external_user_id') || 0] || `user_${i}`,
                email: values[headers.indexOf('email') || 1],
                metadata: headers.indexOf('metadata') >= 0 ? 
                  JSON.parse(values[headers.indexOf('metadata')] || '{}') : {}
              });
            }
          }
          setUploadData(data);
        } else if (file.name.endsWith('.json')) {
          // Parse JSON
          const data = JSON.parse(content);
          setUploadData(Array.isArray(data) ? data : [data]);
        }
        
        toast({
          title: "File Uploaded",
          description: `Successfully parsed ${uploadData.length} users from ${file.name}`
        });
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Failed to parse file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  }, [uploadData.length, toast]);

  const createBulkSessions = useCallback(async () => {
    if (!uploadData.length || !selectedTemplate) {
      toast({
        title: "Validation Error",
        description: "Please upload user data and select a template.",
        variant: "destructive"
      });
      return;
    }

    const operation: BulkOperation = {
      id: `bulk_${Date.now()}`,
      type: 'create_sessions',
      status: 'pending',
      progress: 0,
      totalItems: uploadData.length,
      processedItems: 0,
      failedItems: 0,
      createdAt: new Date()
    };

    setOperations(prev => [operation, ...prev]);

    try {
      // Simulate bulk session creation
      setOperations(prev => prev.map(op => 
        op.id === operation.id ? { ...op, status: 'processing' } : op
      ));

      for (let i = 0; i < uploadData.length; i++) {
        const user = uploadData[i];
        
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Here you would call the actual API
          // const response = await supabase.functions.invoke('api-assessments', {
          //   body: {
          //     external_user_id: user.externalUserId,
          //     template_id: selectedTemplate,
          //     callback_url: bulkCallbackUrl,
          //     client_metadata: user.metadata
          //   }
          // });

          setOperations(prev => prev.map(op => 
            op.id === operation.id ? {
              ...op,
              processedItems: i + 1,
              progress: Math.round(((i + 1) / uploadData.length) * 100)
            } : op
          ));
        } catch (error) {
          setOperations(prev => prev.map(op => 
            op.id === operation.id ? {
              ...op,
              failedItems: op.failedItems + 1
            } : op
          ));
        }
      }

      setOperations(prev => prev.map(op => 
        op.id === operation.id ? {
          ...op,
          status: 'completed',
          completedAt: new Date()
        } : op
      ));

      toast({
        title: "Bulk Operation Complete",
        description: `Created sessions for ${uploadData.length - operation.failedItems} users.`
      });
    } catch (error) {
      setOperations(prev => prev.map(op => 
        op.id === operation.id ? {
          ...op,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        } : op
      ));
    }
  }, [uploadData, selectedTemplate, bulkCallbackUrl, toast]);

  const exportBulkResults = useCallback(async () => {
    const operation: BulkOperation = {
      id: `export_${Date.now()}`,
      type: 'export_results',
      status: 'processing',
      progress: 0,
      totalItems: 1,
      processedItems: 0,
      failedItems: 0,
      createdAt: new Date()
    };

    setOperations(prev => [operation, ...prev]);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample export data
      const exportData = {
        exportDate: new Date().toISOString(),
        filters: exportFilters,
        results: [
          // Sample data - replace with actual API call
          {
            sessionId: 'session_1',
            externalUserId: 'user_1',
            status: 'completed',
            completedAt: '2024-01-15T10:30:00Z',
            recommendations: [
              { career: 'Software Engineer', matchScore: 85 },
              { career: 'Data Scientist', matchScore: 78 }
            ]
          }
        ]
      };

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `assessment_results_${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setOperations(prev => prev.map(op => 
        op.id === operation.id ? {
          ...op,
          status: 'completed',
          progress: 100,
          processedItems: 1,
          completedAt: new Date()
        } : op
      ));

      toast({
        title: "Export Complete",
        description: "Assessment results have been exported successfully."
      });
    } catch (error) {
      setOperations(prev => prev.map(op => 
        op.id === operation.id ? {
          ...op,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Export failed'
        } : op
      ));
    }
  }, [exportFilters, toast]);

  const cancelOperation = useCallback((operationId: string) => {
    setOperations(prev => prev.map(op => 
      op.id === operationId && op.status === 'processing' ? 
        { ...op, status: 'cancelled' } : op
    ));
  }, []);

  const deleteOperation = useCallback((operationId: string) => {
    setOperations(prev => prev.filter(op => op.id !== operationId));
  }, []);

  const getStatusIcon = (status: BulkOperation['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Bulk Management</h2>
        <p className="text-muted-foreground">Manage large-scale operations for assessments and users</p>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Bulk Sessions</TabsTrigger>
          <TabsTrigger value="export">Export Results</TabsTrigger>
          <TabsTrigger value="operations">Operations History</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload User Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Upload CSV or JSON file</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV: external_user_id, email, metadata (optional)<br/>
                    JSON: Array of user objects
                  </p>
                </div>

                {uploadData.length > 0 && (
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      {uploadData.length} users loaded and ready for processing
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="template-select">Assessment Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Assessment</SelectItem>
                      <SelectItem value="technical">Technical Skills</SelectItem>
                      <SelectItem value="leadership">Leadership Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="callback-url">Callback URL (Optional)</Label>
                  <Input
                    id="callback-url"
                    value={bulkCallbackUrl}
                    onChange={(e) => setBulkCallbackUrl(e.target.value)}
                    placeholder="https://your-app.com/webhooks/assessment"
                  />
                </div>

                <Button 
                  onClick={createBulkSessions}
                  disabled={!uploadData.length || !selectedTemplate}
                  className="w-full"
                >
                  Create Bulk Sessions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Download sample CSV or JSON template
                    </p>
                    <div className="flex gap-2 mt-3 justify-center">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        CSV Template
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        JSON Template
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <h4 className="font-medium mb-2">Required Fields:</h4>
                    <ul className="space-y-1">
                      <li>• external_user_id: Unique identifier</li>
                      <li>• email: User email address</li>
                      <li>• metadata: Additional user data (optional)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Assessment Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select 
                    value={exportFilters.dateRange} 
                    onValueChange={(value) => setExportFilters(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_7_days">Last 7 days</SelectItem>
                      <SelectItem value="last_30_days">Last 30 days</SelectItem>
                      <SelectItem value="last_90_days">Last 90 days</SelectItem>
                      <SelectItem value="all_time">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status-filter">Status Filter</Label>
                  <Select 
                    value={exportFilters.status} 
                    onValueChange={(value) => setExportFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed Only</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="org-filter">Organization</Label>
                  <Input
                    id="org-filter"
                    value={exportFilters.organizationId}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, organizationId: e.target.value }))}
                    placeholder="Organization ID"
                  />
                </div>
              </div>

              <Button onClick={exportBulkResults} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operations History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {operation.type.replace('_', ' ').toUpperCase()}
                          </div>
                          {operation.errorMessage && (
                            <div className="text-xs text-red-600">{operation.errorMessage}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(operation.status)}
                          <Badge variant={
                            operation.status === 'completed' ? 'default' :
                            operation.status === 'failed' ? 'destructive' :
                            operation.status === 'processing' ? 'secondary' : 'outline'
                          }>
                            {operation.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={operation.progress} className="w-20" />
                          <div className="text-xs text-muted-foreground">
                            {operation.progress}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{operation.processedItems}/{operation.totalItems}</div>
                          {operation.failedItems > 0 && (
                            <div className="text-red-600">{operation.failedItems} failed</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {operation.createdAt.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {operation.status === 'processing' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => cancelOperation(operation.id)}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteOperation(operation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {operations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No operations found. Start a bulk operation to see it here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
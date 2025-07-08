import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Copy, Eye, EyeOff, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIManagementProps {
  organization: any;
}

export function APIManagement({ organization }: APIManagementProps) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const { toast } = useToast();

  // Mock data - replace with real API calls
  const apiKeys = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'pk_live_1234567890abcdef',
      environment: 'production',
      created: '2024-01-15',
      lastUsed: '2024-01-20',
      status: 'active'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'pk_test_abcdef1234567890',
      environment: 'development',
      created: '2024-01-10',
      lastUsed: '2024-01-19',
      status: 'active'
    }
  ];

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleCreateKey = () => {
    // Implementation for creating new API key
    toast({
      title: "API Key Created",
      description: `New API key "${newKeyName}" has been created successfully.`,
    });
    setNewKeyName('');
  };

  const handleDeleteKey = (keyId: string) => {
    // Implementation for deleting API key
    toast({
      title: "API Key Deleted",
      description: "The API key has been permanently deleted.",
      variant: "destructive",
    });
  };

  const handleRotateKey = (keyId: string) => {
    // Implementation for rotating API key
    toast({
      title: "API Key Rotated",
      description: "A new API key has been generated. Please update your applications.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">API Management</h1>
        <p className="text-muted-foreground">Manage your API keys and access controls</p>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          {/* Create New Key */}
          <Card>
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
              <CardDescription>
                Generate a new API key for your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Production, Staging, Development"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateKey} disabled={!newKeyName}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Key
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Keys */}
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>
                Manage and monitor your existing API keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showKeys[apiKey.id] 
                              ? apiKey.key 
                              : apiKey.key.substring(0, 8) + '••••••••••••••••'
                            }
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {showKeys[apiKey.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyKey(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={apiKey.environment === 'production' ? 'default' : 'secondary'}>
                          {apiKey.environment}
                        </Badge>
                      </TableCell>
                      <TableCell>{apiKey.lastUsed}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          {apiKey.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRotateKey(apiKey.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete
                                  the API key and revoke access for all applications using it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteKey(apiKey.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Complete guide to using the PicoCareer Assessment API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Quick Start Guide</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get started with your first API call in minutes
                    </p>
                    <Button variant="outline" size="sm">
                      View Guide
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">API Reference</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete reference for all API endpoints
                    </p>
                    <Button variant="outline" size="sm">
                      Browse Reference
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Set up webhooks to receive real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Webhook configuration interface coming soon. Configure real-time
                notifications for assessment completions, user events, and more.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

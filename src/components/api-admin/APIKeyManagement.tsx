import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Key, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface APIKey {
  id: string;
  key_name: string;
  key_prefix: string;
  organization_id: string;
  environment: 'production' | 'sandbox';
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  expires_at?: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  api_organizations: {
    name: string;
  };
}

interface Organization {
  id: string;
  name: string;
}

export function APIKeyManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    organization_id: "",
    key_name: "",
    environment: "production" as const,
    rate_limit_per_minute: 60,
    rate_limit_per_day: 1000,
    expires_at: ""
  });

  useEffect(() => {
    Promise.all([fetchAPIKeys(), fetchOrganizations()]);
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('api-keys');
      
      if (error) throw error;
      
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('api-organizations');
      
      if (error) throw error;
      
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.functions.invoke('api-keys', {
        method: 'POST',
        body: {
          ...formData,
          expires_at: formData.expires_at || null
        }
      });
      
      if (error) throw error;
      
      setNewApiKey(data.api_key);
      setShowNewKey(true);
      
      toast({
        title: "Success",
        description: "API key created successfully",
      });
      
      setFormData({
        organization_id: "",
        key_name: "",
        environment: "production",
        rate_limit_per_minute: 60,
        rate_limit_per_day: 1000,
        expires_at: ""
      });
      
      fetchAPIKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (keyId: string) => {
    if (!confirm('Are you sure you want to deactivate this API key?')) return;
    
    try {
      const { error } = await supabase.functions.invoke('api-keys', {
        method: 'PUT',
        body: { 
          id: keyId,
          is_active: false 
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "API key deactivated successfully",
      });
      
      fetchAPIKeys();
    } catch (error) {
      console.error('Error deactivating API key:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate API key",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const getEnvironmentColor = (env: string) => {
    return env === 'production' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading API keys...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">API Keys ({apiKeys.length})</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for an organization
              </DialogDescription>
            </DialogHeader>
            
            {newApiKey && showNewKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">API Key Generated Successfully!</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Please copy this key now. You won't be able to see it again.
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                      {newApiKey}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(newApiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewApiKey(null);
                    setShowNewKey(false);
                  }}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organization_id">Organization *</Label>
                  <Select
                    value={formData.organization_id}
                    onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="key_name">Key Name *</Label>
                  <Input
                    id="key_name"
                    value={formData.key_name}
                    onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                    placeholder="e.g., Production API Key"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={formData.environment}
                    onValueChange={(value: any) => setFormData({ ...formData, environment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate_limit_per_minute">Rate Limit (per minute)</Label>
                    <Input
                      id="rate_limit_per_minute"
                      type="number"
                      value={formData.rate_limit_per_minute}
                      onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate_limit_per_day">Rate Limit (per day)</Label>
                    <Input
                      id="rate_limit_per_day"
                      type="number"
                      value={formData.rate_limit_per_day}
                      onChange={(e) => setFormData({ ...formData, rate_limit_per_day: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiration Date (optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Generate API Key
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {apiKeys.map((key) => (
          <Card key={key.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{key.key_name}</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getEnvironmentColor(key.environment)}>
                  {key.environment}
                </Badge>
                <Badge variant={key.is_active ? "default" : "secondary"}>
                  {key.is_active ? "Active" : "Inactive"}
                </Badge>
                {key.is_active && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeactivate(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                    {key.key_prefix}***************************
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${key.key_prefix}***************************`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Organization:</span> {key.api_organizations.name}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(key.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Rate Limit:</span> {key.rate_limit_per_minute}/min, {key.rate_limit_per_day}/day
                  </div>
                  <div>
                    <span className="font-medium">Last Used:</span>{' '}
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                  </div>
                  {key.expires_at && (
                    <div className="col-span-2">
                      <span className="font-medium">Expires:</span>{' '}
                      {new Date(key.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {apiKeys.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No API keys found</p>
              <p className="text-sm text-muted-foreground">Generate your first API key to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
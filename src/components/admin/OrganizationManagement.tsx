
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Key, Users, BarChart3, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Organization {
  id: string;
  name: string;
  description: string;
  website: string;
  contact_email: string;
  industry: string;
  size: string;
  created_at: string;
  organization_api_keys?: ApiKey[];
}

interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  rate_limit_per_minute: number;
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_api_keys (
            id, name, permissions, rate_limit_per_minute,
            is_active, usage_count, last_used_at, created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch organizations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (formData: FormData) => {
    try {
      const orgData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        website: formData.get('website') as string,
        contact_email: formData.get('contact_email') as string,
        industry: formData.get('industry') as string,
        size: formData.get('size') as string,
      };

      const response = await supabase.functions.invoke('org-management', {
        body: orgData,
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Organization created successfully",
      });

      setShowCreateDialog(false);
      fetchOrganizations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive",
      });
    }
  };

  const createApiKey = async (formData: FormData) => {
    if (!selectedOrg) return;

    try {
      const keyData = {
        name: formData.get('name') as string,
        permissions: (formData.get('permissions') as string).split(','),
        rate_limit_per_minute: parseInt(formData.get('rate_limit') as string),
      };

      const response = await supabase.functions.invoke('org-management', {
        body: keyData,
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "API key created successfully",
      });

      setShowCreateKeyDialog(false);
      fetchOrganizations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">Manage API access for organizations</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Set up a new organization with API access
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              createOrganization(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" type="url" />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" name="contact_email" type="email" required />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select name="industry">
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="size">Organization Size</Label>
                <Select name="size">
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-50)</SelectItem>
                    <SelectItem value="small">Small (51-200)</SelectItem>
                    <SelectItem value="medium">Medium (201-1000)</SelectItem>
                    <SelectItem value="large">Large (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create Organization</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {organizations.map((org) => (
          <Card key={org.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {org.name}
                  </CardTitle>
                  <CardDescription>{org.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{org.industry}</Badge>
                  <Badge variant="secondary">{org.size}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Website:</span> {org.website}
                  </div>
                  <div>
                    <span className="font-medium">Contact:</span> {org.contact_email}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      API Keys ({org.organization_api_keys?.length || 0})
                    </h3>
                    <Dialog open={showCreateKeyDialog && selectedOrg?.id === org.id} onOpenChange={(open) => {
                      setShowCreateKeyDialog(open);
                      if (open) setSelectedOrg(org);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Plus className="h-3 w-3" />
                          Add Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create API Key</DialogTitle>
                          <DialogDescription>
                            Generate a new API key for {org.name}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          createApiKey(new FormData(e.currentTarget));
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Key Name</Label>
                            <Input id="name" name="name" placeholder="Production API Key" required />
                          </div>
                          <div>
                            <Label htmlFor="permissions">Permissions</Label>
                            <Input id="permissions" name="permissions" placeholder="chat,search,analytics" defaultValue="chat,search" />
                          </div>
                          <div>
                            <Label htmlFor="rate_limit">Rate Limit (per minute)</Label>
                            <Input id="rate_limit" name="rate_limit" type="number" defaultValue="60" />
                          </div>
                          <Button type="submit" className="w-full">Create API Key</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {org.organization_api_keys && org.organization_api_keys.length > 0 ? (
                    <div className="space-y-2">
                      {org.organization_api_keys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{key.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {key.permissions.join(', ')} • {key.rate_limit_per_minute}/min • Used {key.usage_count} times
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={key.is_active ? "default" : "secondary"}>
                              {key.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {key.last_used_at && (
                              <Badge variant="outline">
                                Last used: {new Date(key.last_used_at).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No API keys created yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {organizations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No organizations registered yet</p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Organization
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

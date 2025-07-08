import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface Organization {
  id: string;
  name: string;
  domain?: string;
  contact_email: string;
  contact_name?: string;
  phone?: string;
  subscription_tier: 'free' | 'basic' | 'professional' | 'enterprise';
  status: 'Pending' | 'Approved' | 'Suspended';
  created_at: string;
  hub_id?: string;
}

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    contact_email: "",
    contact_name: "",
    phone: "",
    subscription_tier: "free" as 'free' | 'basic' | 'professional' | 'enterprise',
    hub_id: ""
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('api-organizations', {
        method: 'GET',
      });
      
      if (error) {
        console.error('API organizations error:', error);
        throw error;
      }
      
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: `Failed to fetch organizations: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingOrg) {
        // Update existing organization
        const { error } = await supabase.functions.invoke(`api-organizations/${editingOrg.id}`, {
          method: 'PUT',
          body: formData
        });
        
        if (error) {
          console.error('Update organization error:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Organization updated successfully",
        });
      } else {
        // Create new organization
        const { error } = await supabase.functions.invoke('api-organizations', {
          method: 'POST',
          body: formData
        });
        
        if (error) {
          console.error('Create organization error:', error);
          throw error;
        }
        
        toast({
          title: "Success", 
          description: "Organization created successfully",
        });
      }
      
      setFormData({
        name: "",
        domain: "",
        contact_email: "",
        contact_name: "",
        phone: "",
        subscription_tier: "free",
        hub_id: ""
      });
      setIsCreateDialogOpen(false);
      setEditingOrg(null);
      fetchOrganizations();
    } catch (error) {
      console.error('Error saving organization:', error);
      toast({
        title: "Error",
        description: `Failed to save organization: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      domain: org.domain || "",
      contact_email: org.contact_email,
      contact_name: org.contact_name || "",
      phone: org.phone || "",
      subscription_tier: org.subscription_tier,
      hub_id: org.hub_id || ""
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;
    
    try {
      const { error } = await supabase.functions.invoke(`api-organizations/${orgId}`, {
        method: 'DELETE',
      });
      
      if (error) {
        console.error('Delete organization error:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Organization deleted successfully",
      });
      
      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: `Failed to delete organization: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading organizations...</div>;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Organizations ({organizations.length})</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingOrg(null);
              setFormData({
                name: "",
                domain: "",
                contact_email: "",
                contact_name: "",
                phone: "",
                subscription_tier: "free",
                hub_id: ""
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingOrg ? 'Edit Organization' : 'Create New Organization'}
              </DialogTitle>
              <DialogDescription>
                {editingOrg ? 'Update organization details' : 'Add a new organization to the system'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription_tier">Subscription Tier</Label>
                  <Select
                    value={formData.subscription_tier}
                    onValueChange={(value: any) => setFormData({ ...formData, subscription_tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hub_id">Hub ID (optional)</Label>
                <Input
                  id="hub_id"
                  value={formData.hub_id}
                  onChange={(e) => setFormData({ ...formData, hub_id: e.target.value })}
                  placeholder="Connect to existing hub"
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOrg ? 'Update Organization' : 'Create Organization'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {organizations.map((org) => (
          <Card key={org.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{org.name}</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getTierColor(org.subscription_tier)}>
                  {org.subscription_tier}
                </Badge>
                <Badge className={getStatusColor(org.status)}>
                  {org.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(org)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(org.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Contact:</span> {org.contact_email}
                  {org.contact_name && <span className="text-muted-foreground"> ({org.contact_name})</span>}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(org.created_at).toLocaleDateString()}
                </div>
                {org.domain && (
                  <div>
                    <span className="font-medium">Domain:</span> {org.domain}
                  </div>
                )}
                {org.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {org.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {organizations.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No organizations found</p>
              <p className="text-sm text-muted-foreground">Create your first organization to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </ErrorBoundary>
  );
}
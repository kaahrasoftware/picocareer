import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Quota {
  id: string;
  organization_id: string;
  quota_type: string;
  period_type: string;
  limit_value: number;
  reset_day?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  api_organizations?: {
    name: string;
  };
}

interface Organization {
  id: string;
  name: string;
}

interface QuotaUsage {
  quota_type: string;
  period_type: string;
  limit: number;
  used: number;
  remaining: number;
  period_start: string;
}

export function QuotaManagement() {
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [quotaUsage, setQuotaUsage] = useState<{ [key: string]: QuotaUsage }>({});
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuota, setEditingQuota] = useState<Quota | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    organization_id: "",
    quota_type: "requests",
    period_type: "monthly",
    limit_value: 1000,
    reset_day: 1
  });

  useEffect(() => {
    Promise.all([fetchQuotas(), fetchOrganizations()]);
  }, []);

  const fetchQuotas = async () => {
    try {
      const { data: quotasData, error: quotasError } = await supabase
        .from('api_quotas')
        .select(`
          *,
          api_organizations!inner(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (quotasError) throw quotasError;

      setQuotas(quotasData || []);

      // Fetch usage data for each quota
      const usagePromises = (quotasData || []).map(async (quota) => {
        try {
          const { data: usageData, error: usageError } = await supabase.rpc('check_quota_usage', {
            p_organization_id: quota.organization_id,
            p_quota_type: quota.quota_type,
            p_period_type: quota.period_type
          });

          if (usageError) throw usageError;

          return {
            key: `${quota.organization_id}-${quota.quota_type}-${quota.period_type}`,
            usage: usageData as QuotaUsage
          };
        } catch (error) {
          console.error('Error fetching usage for quota:', quota.id, error);
          return null;
        }
      });

      const usageResults = await Promise.all(usagePromises);
      const usageMap: { [key: string]: QuotaUsage } = {};
      
      usageResults.forEach((result) => {
        if (result && result.usage) {
          usageMap[result.key] = result.usage;
        }
      });

      setQuotaUsage(usageMap);
    } catch (error) {
      console.error('Error fetching quotas:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quotas",
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
      if (editingQuota) {
        const { error } = await supabase
          .from('api_quotas')
          .update({
            quota_type: formData.quota_type,
            period_type: formData.period_type,
            limit_value: formData.limit_value,
            reset_day: formData.period_type === 'monthly' ? formData.reset_day : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingQuota.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Quota updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('api_quotas')
          .insert({
            organization_id: formData.organization_id,
            quota_type: formData.quota_type,
            period_type: formData.period_type,
            limit_value: formData.limit_value,
            reset_day: formData.period_type === 'monthly' ? formData.reset_day : null,
            is_active: true
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Quota created successfully",
        });
      }
      
      setFormData({
        organization_id: "",
        quota_type: "requests",
        period_type: "monthly",
        limit_value: 1000,
        reset_day: 1
      });
      setIsCreateDialogOpen(false);
      setEditingQuota(null);
      fetchQuotas();
    } catch (error) {
      console.error('Error saving quota:', error);
      toast({
        title: "Error",
        description: "Failed to save quota",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (quota: Quota) => {
    setEditingQuota(quota);
    setFormData({
      organization_id: quota.organization_id,
      quota_type: quota.quota_type,
      period_type: quota.period_type,
      limit_value: quota.limit_value,
      reset_day: quota.reset_day || 1
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (quotaId: string) => {
    if (!confirm('Are you sure you want to delete this quota?')) return;
    
    try {
      const { error } = await supabase
        .from('api_quotas')
        .update({ is_active: false })
        .eq('id', quotaId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Quota deleted successfully",
      });
      
      fetchQuotas();
    } catch (error) {
      console.error('Error deleting quota:', error);
      toast({
        title: "Error",
        description: "Failed to delete quota",
        variant: "destructive",
      });
    }
  };

  const getUsageColor = (usage: QuotaUsage) => {
    const percentage = (usage.used / usage.limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading quotas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">API Quotas ({quotas.length})</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingQuota(null);
              setFormData({
                organization_id: "",
                quota_type: "requests",
                period_type: "monthly",
                limit_value: 1000,
                reset_day: 1
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quota
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingQuota ? 'Edit Quota' : 'Create New Quota'}
              </DialogTitle>
              <DialogDescription>
                {editingQuota ? 'Update quota limits' : 'Set usage limits for an organization'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organization_id">Organization *</Label>
                <Select
                  value={formData.organization_id}
                  onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                  required
                  disabled={!!editingQuota}
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quota_type">Quota Type</Label>
                  <Select
                    value={formData.quota_type}
                    onValueChange={(value) => setFormData({ ...formData, quota_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requests">API Requests</SelectItem>
                      <SelectItem value="assessments">Assessments</SelectItem>
                      <SelectItem value="data_transfer">Data Transfer</SelectItem>
                      <SelectItem value="storage">Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="period_type">Period Type</Label>
                  <Select
                    value={formData.period_type}
                    onValueChange={(value) => setFormData({ ...formData, period_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit_value">Limit Value *</Label>
                <Input
                  id="limit_value"
                  type="number"
                  value={formData.limit_value}
                  onChange={(e) => setFormData({ ...formData, limit_value: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              
              {formData.period_type === 'monthly' && (
                <div className="space-y-2">
                  <Label htmlFor="reset_day">Reset Day (1-28)</Label>
                  <Input
                    id="reset_day"
                    type="number"
                    value={formData.reset_day}
                    onChange={(e) => setFormData({ ...formData, reset_day: parseInt(e.target.value) })}
                    min="1"
                    max="28"
                  />
                </div>
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingQuota ? 'Update Quota' : 'Create Quota'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {quotas.map((quota) => {
          const usageKey = `${quota.organization_id}-${quota.quota_type}-${quota.period_type}`;
          const usage = quotaUsage[usageKey];
          const usagePercentage = usage ? (usage.used / usage.limit) * 100 : 0;
          
          return (
            <Card key={quota.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">
                    {quota.api_organizations?.name} - {quota.quota_type}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {quota.period_type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(quota)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(quota.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Limit:</span> {formatNumber(quota.limit_value)}
                    </div>
                    <div>
                      <span className="font-medium">Used:</span>{' '}
                      <span className={usage ? getUsageColor(usage) : ''}>
                        {usage ? formatNumber(usage.used) : 'Loading...'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Remaining:</span>{' '}
                      {usage ? formatNumber(usage.remaining) : 'Loading...'}
                    </div>
                  </div>
                  
                  {usage && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Usage</span>
                        <span className={getUsageColor(usage)}>
                          {usagePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={usagePercentage} 
                        className={`h-2 ${usagePercentage >= 90 ? 'text-red-600' : usagePercentage >= 75 ? 'text-yellow-600' : 'text-green-600'}`}
                      />
                      <div className="text-xs text-muted-foreground">
                        Period: {new Date(usage.period_start).toLocaleDateString()} - Present
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(quota.created_at).toLocaleDateString()}
                    {quota.reset_day && quota.period_type === 'monthly' && (
                      <span> • Resets on day {quota.reset_day} of each month</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {quotas.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No quotas found</p>
              <p className="text-sm text-muted-foreground">Create quotas to manage organization usage limits</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
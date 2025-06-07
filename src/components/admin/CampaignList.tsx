
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CampaignCard } from "./CampaignCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, Mail, Sparkles, TrendingUp, Users, Clock } from "lucide-react";
import type { Campaign } from "@/types/database/email";

interface CampaignListProps {
  adminId: string;
}

export function CampaignList({ adminId }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      console.log('Loading campaigns for admin ID:', adminId);
      
      const { data, error } = await supabase
        .from('email_campaigns')
        .select(`
          id, 
          subject, 
          content_type, 
          content_id, 
          content_ids,
          frequency, 
          scheduled_for,
          status,
          sent_at,
          recipient_type,
          sent_count,
          failed_count,
          recipients_count,
          created_at,
          last_error,
          last_checked_at,
          admin_id,
          updated_at
        `)
        .eq('admin_id', adminId)
        .order('scheduled_for', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      console.log('Campaigns loaded:', data?.length || 0);
      
      const typedCampaigns: Campaign[] = (data || []).map(item => ({
        ...item,
        name: item.subject || "Unnamed Campaign",
        subject: item.subject || "Unnamed Campaign",
        status: (item.status as Campaign['status']) || "draft",
        sent_count: item.sent_count || 0,
        recipients_count: item.recipients_count || 0,
        failed_count: item.failed_count || 0,
        frequency: item.frequency as Campaign['frequency'] || "once"
      }));
      
      setCampaigns(typedCampaigns);
    } catch (err: any) {
      console.error('Error loading campaigns:', err);
      toast.error('Could not load campaigns. Please try again.');
    } finally {
      setLoadingCampaigns(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (adminId) {
      loadCampaigns();
    }
  }, [adminId]);

  const handleSendCampaign = async (campaignId: string) => {
    if (!campaignId) return;
    setSendingCampaign(campaignId);
    try {
      const { data, error } = await supabase.functions.invoke('send-campaign-emails', {
        body: { campaignId }
      });

      if (error) {
        console.error("Edge function error (network or permissions):", error);
        throw error;
      }

      if (!data || data.success !== true) {
        console.error("Unsuccessful send-campaign-emails result:", data);
        throw new Error(
          (data && (data.error || data.message)) ||
          "Unknown error: No valid response from email campaign function. Check edge logs."
        );
      }

      toast.success(`Campaign sent successfully to ${data.sent} recipients`);
      loadCampaigns();
    } catch (err: any) {
      toast.error(`Error sending campaign: ${err?.message || "Unknown error"}`);
      console.error("Send campaign error (caught in handler):", err);
    } finally {
      setSendingCampaign(null);
    }
  };

  const handleCheckScheduledCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-scheduled-campaigns', {});
      if (error) {
        console.error("Check scheduled campaigns - network error:", error);
        throw error;
      }
      if (!data || data.success !== true) {
        console.error("Unsuccessful check-scheduled-campaigns result:", data);
        throw new Error(
          (data && (data.error || data.message)) ||
          "Unknown error: No valid response from campaign scheduler function. Check edge logs."
        );
      }
      toast.success(data.campaigns_processed
        ? `Processed ${data.campaigns_processed} campaigns`
        : (data.message || "No campaigns due for sending"));
        
      loadCampaigns();
    } catch (err: any) {
      toast.error(`Error checking scheduled campaigns: ${err?.message || "Unknown error"}`);
      console.error("Check scheduled campaigns error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCampaigns();
  };

  // Calculate stats from campaigns
  const stats = {
    totalCampaigns: campaigns.length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
    totalRecipients: campaigns.reduce((sum, c) => sum + c.recipients_count, 0),
    activeCampaigns: campaigns.filter(c => c.status === 'sending' || c.status === 'pending').length
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-blue-600 font-medium">Total Campaigns</p>
            <p className="text-lg font-bold text-blue-800">{stats.totalCampaigns}</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium">Emails Sent</p>
            <p className="text-lg font-bold text-green-800">{stats.totalSent}</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-purple-600 font-medium">Total Reach</p>
            <p className="text-lg font-bold text-purple-800">{stats.totalRecipients}</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-orange-600 font-medium">Active</p>
            <p className="text-lg font-bold text-orange-800">{stats.activeCampaigns}</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {campaigns.length} campaigns • Last updated: {new Date().toLocaleTimeString()}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckScheduledCampaigns}
            disabled={loading}
            className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Check Scheduled
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loadingCampaigns || refreshing}
            className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
          >
            {loadingCampaigns || refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Campaign Cards Grid */}
      {loadingCampaigns ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="flex gap-2">
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="py-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Campaigns Yet
                </h3>
                <p className="text-gray-600 text-sm">
                  Create your first email campaign to start engaging with your audience.
                  Use the form on the left to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {campaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              sendingCampaign={sendingCampaign}
              onSend={handleSendCampaign}
            />
          ))}
        </div>
      )}
    </div>
  );
}

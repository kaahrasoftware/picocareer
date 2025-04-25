
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CampaignCard } from "./CampaignCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Campaign } from "@/types/database/email";

interface CampaignListProps {
  adminId: string;
}

export function CampaignList({ adminId }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null);

  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
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
      
      // Map the data to ensure status is of correct type
      const typedCampaigns: Campaign[] = (data || []).map(item => ({
        ...item,
        status: (item.status as "planned" | "pending" | "sending" | "sent" | "failed" | "partial") || "planned"
      }));
      
      setCampaigns(typedCampaigns);
    } catch (err: any) {
      toast({
        title: "Error loading campaigns",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    if (adminId) {
      loadCampaigns();
    }
    // eslint-disable-next-line
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

      toast({
        title: "Campaign sent successfully",
        description: `Sent to ${data.sent} recipients (${data.failed} failed)`
      });

      loadCampaigns();
    } catch (err: any) {
      toast({
        title: "Error sending campaign",
        description: err?.message ?? "Unknown error occurred. Check network and edge function logs.",
        variant: "destructive"
      });
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
      toast({
        title: "Checked scheduled campaigns",
        description: data.campaigns_processed
          ? `Processed ${data.campaigns_processed} campaigns`
          : (data.message || "No campaigns due for sending")
      });
      loadCampaigns();
    } catch (err: any) {
      toast({
        title: "Error checking scheduled campaigns",
        description: err?.message ?? "Unknown error occurred. Check network and edge function logs.",
        variant: "destructive"
      });
      console.error("Check scheduled campaigns error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Recent Campaigns
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckScheduledCampaigns}
            disabled={loading}
            className="border-primary/20 hover:border-primary/40 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : "Check Scheduled"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadCampaigns}
            disabled={loadingCampaigns}
            className="border-primary/20 hover:border-primary/40 transition-colors"
          >
            {loadingCampaigns ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : "Refresh"}
          </Button>
        </div>
      </div>
      
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {loadingCampaigns ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                <p>No campaigns found.</p>
                <p className="text-sm">Create a new campaign to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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

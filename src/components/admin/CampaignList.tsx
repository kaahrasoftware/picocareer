
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CampaignCard } from "./CampaignCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type Campaign = {
  id: string;
  subject: string;
  content_type: string;
  content_id: string;
  frequency: string;
  scheduled_for: string;
  status: string;
  sent_at: string | null;
  recipient_type: string;
  sent_count: number;
  failed_count: number;
  recipients_count: number;
  created_at: string;
  last_error: string | null;
  last_checked_at: string | null;
};

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
          last_checked_at
        `)
        .eq('admin_id', adminId)
        .order('scheduled_for', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCampaigns(data || []);
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

      if (error) throw error;

      if (data && data.success) {
        toast({
          title: "Campaign sent successfully",
          description: `Sent to ${data.sent} recipients (${data.failed} failed)`
        });

        loadCampaigns();
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected error: No response from email campaign function.");
      }
    } catch (err: any) {
      toast({
        title: "Error sending campaign",
        description: err?.message ?? "Unknown error occurred. Check network and edge function logs.",
        variant: "destructive"
      });
    } finally {
      setSendingCampaign(null);
    }
  };

  const handleCheckScheduledCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-scheduled-campaigns', {});
      if (error) throw error;
      if (data && data.success) {
        toast({
          title: "Checked scheduled campaigns",
          description: data.campaigns_processed
            ? `Processed ${data.campaigns_processed} campaigns`
            : (data.message || "No campaigns due for sending")
        });
        loadCampaigns();
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected error: No response from campaign scheduler function.");
      }
    } catch (err: any) {
      toast({
        title: "Error checking scheduled campaigns",
        description: err?.message ?? "Unknown error occurred. Check network and edge function logs.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Campaigns</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckScheduledCampaigns}
            disabled={loading}
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
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <p>No campaigns found.</p>
                <p className="text-sm mt-2">Create a new campaign to get started.</p>
              </>
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


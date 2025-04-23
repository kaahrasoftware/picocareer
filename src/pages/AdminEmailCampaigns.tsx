
import { useState } from "react";
import { EmailCampaignForm } from "@/components/admin/EmailCampaignForm";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

/**
 * AdminEmailCampaigns page for admins to plan and schedule spotlight emails.
 */
export default function AdminEmailCampaigns() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null);

  // Load scheduled campaigns
  const loadCampaigns = async () => {
    if (!profile) return;
    
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
          created_at
        `)
        .eq('admin_id', profile.id)
        .order('created_at', { ascending: false })
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

  // Handle sending a campaign
  const handleSendCampaign = async (campaignId: string) => {
    if (!campaignId) return;
    
    setSendingCampaign(campaignId);
    try {
      const { data, error } = await supabase.functions.invoke('send-campaign-emails', {
        body: { campaignId }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Campaign sent successfully",
          description: `Sent to ${data.sent} recipients (${data.failed} failed)`
        });
        
        // Refresh campaigns list
        loadCampaigns();
      } else {
        throw new Error(data.message || "Failed to send campaign");
      }
    } catch (err: any) {
      toast({
        title: "Error sending campaign",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSendingCampaign(null);
    }
  };

  if (!profile) return null;
  if (profile.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h1 className="text-2xl font-bold mb-4">Email Campaign Planner</h1>
          <EmailCampaignForm 
            adminId={profile.id}
            onCampaignCreated={() => {
              setLoading(true);
              loadCampaigns().finally(() => setLoading(false));
            }}
          />
        </div>
        
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Campaigns</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => loadCampaigns()}
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
                <Card key={campaign.id} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{campaign.subject || "Unnamed Campaign"}</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>Type: {campaign.content_type}</p>
                          <p>Scheduled: {new Date(campaign.scheduled_for).toLocaleString()}</p>
                          <p>Recipients: {campaign.recipient_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'sent' ? (
                          <div className="text-sm text-green-600 font-medium">
                            Sent ({campaign.sent_count} recipients)
                          </div>
                        ) : campaign.status === 'partial' ? (
                          <div className="text-sm text-amber-600 font-medium">
                            Partially Sent ({campaign.sent_count}/{campaign.sent_count + campaign.failed_count})
                          </div>
                        ) : campaign.status === 'failed' ? (
                          <div className="text-sm text-red-600 font-medium">
                            Failed to Send
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSendCampaign(campaign.id)}
                            disabled={sendingCampaign === campaign.id}
                          >
                            {sendingCampaign === campaign.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : "Send Now"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

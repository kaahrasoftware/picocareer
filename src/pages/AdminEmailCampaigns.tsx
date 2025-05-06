
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Navigate } from "react-router-dom";
import { CampaignList } from "@/components/admin/CampaignList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailCampaignForm from "@/components/admin/email-campaign-form/EmailCampaignForm";
import { TemplateSettingsTab } from "@/components/admin/email-templates/TemplateSettingsTab";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function AdminEmailCampaigns() {
  const { session, refreshSession } = useAuthSession();
  const { data: profile, isLoading: profileLoading } = useUserProfile(session);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [campaignListKey, setCampaignListKey] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check session on load
  useEffect(() => {
    checkSession();
  }, []);

  // Periodically check session to ensure we catch expirations
  useEffect(() => {
    const interval = setInterval(() => {
      checkSession();
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setAuthError("Your session has expired. Please refresh the session to continue.");
      } else {
        setAuthError(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setAuthError("Error checking your session status. Please refresh the page.");
    }
  };

  const handleSessionRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshSession();
      if (result) {
        setAuthError(null);
        toast.success("Session refreshed successfully");
      } else {
        toast.error("Failed to refresh session. Please try logging in again.");
      }
    } catch (err) {
      console.error("Session refresh error:", err);
      toast.error("Error refreshing session");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCampaignCreated = (campaignId: string) => {
    toast.success("Campaign created successfully!", {
      description: "The page will refresh to show your new campaign."
    });
    
    // Use setTimeout to allow the toast to be visible before refreshing
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (profileLoading) return <div className="container py-8">Loading...</div>;
  if (!profile) return null;
  if (profile.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-8">
      {authError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{authError}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSessionRefresh}
              disabled={isRefreshing}
              className="whitespace-nowrap"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Session
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="template-settings">Template Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8 shadow-md">
                <h1 className="text-2xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Email Campaign Planner
                </h1>
                <EmailCampaignForm
                  adminId={profile.id}
                  onCampaignCreated={handleCampaignCreated}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <CampaignList 
                adminId={profile.id} 
                key={campaignListKey} 
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="template-settings">
          <TemplateSettingsTab adminId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

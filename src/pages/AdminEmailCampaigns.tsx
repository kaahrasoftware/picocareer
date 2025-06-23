import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Navigate, useSearchParams } from "react-router-dom";
import { CampaignList } from "@/components/admin/CampaignList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailCampaignForm from "@/components/admin/email-campaign-form/EmailCampaignForm";
import { TemplateSettingsTab } from "@/components/admin/email-templates/TemplateSettingsTab";
import { ScholarshipScraperTab } from "@/components/admin/ScholarshipScraperTab";
import { useEmailCampaignAnalytics } from "@/hooks/useEmailCampaignAnalytics";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Plus, BarChart, Settings, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function AdminEmailCampaigns() {
  const { session, refreshSession } = useAuthSession();
  const { data: profile, isLoading: profileLoading } = useUserProfile(session);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || "create-campaign";
  });
  const [campaignListKey, setCampaignListKey] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);

  // Get real analytics data
  const analytics = useEmailCampaignAnalytics(profile?.id || '');

  // Check session on load and periodically
  useEffect(() => {
    checkSession();
    const interval = setInterval(() => {
      checkSession();
    }, 2 * 60 * 1000); // Check every 2 minutes

    return () => clearInterval(interval);
  }, []);
  const checkSession = async () => {
    try {
      const {
        data,
        error
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Session check error:", error);
        setAuthError("Session error. Please refresh to continue.");
        setSessionValid(false);
        return;
      }
      if (!data.session) {
        setAuthError("Your session has expired. Please refresh the session to continue.");
        setSessionValid(false);
        return;
      }

      // Check if session is close to expiring (within 10 minutes)
      if (data.session.expires_at) {
        const expiryTime = new Date(data.session.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = expiryTime.getTime() - now.getTime();
        if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
          setAuthError("Your session will expire soon. Please refresh to continue working.");
          setSessionValid(false);
          return;
        }
      }
      setAuthError(null);
      setSessionValid(true);
    } catch (error) {
      console.error("Error checking session:", error);
      setAuthError("Error checking your session status. Please refresh the page.");
      setSessionValid(false);
    }
  };
  const handleSessionRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshSession();
      if (result) {
        setAuthError(null);
        setSessionValid(true);
        toast.success("Session refreshed successfully");
        // Recheck session after refresh
        setTimeout(checkSession, 1000);
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
      description: "Switching to dashboard to view your new campaign."
    });

    // Switch to dashboard tab to show the new campaign
    setActiveTab("dashboard");
    setCampaignListKey(prev => prev + 1);
  };
  if (profileLoading) return <div className="container py-8">Loading...</div>;
  if (!profile) return null;
  if (profile.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container py-6 space-y-8">
        {authError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Warning</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{authError}</span>
              <Button variant="outline" size="sm" onClick={handleSessionRefresh} disabled={isRefreshing} className="whitespace-nowrap">
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

        {/* Modern Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200/50 p-1">
              <TabsTrigger value="create-campaign" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Plus className="h-4 w-4" />
                Create Campaign
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart className="h-4 w-4" />
                Campaign Dashboard
              </TabsTrigger>
              <TabsTrigger value="template-settings" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Settings className="h-4 w-4" />
                Template Studio
              </TabsTrigger>
              <TabsTrigger value="scholarship-scraper" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Database className="h-4 w-4" />
                Scholarship Scraper
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="create-campaign">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 px-6 py-5 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Create New Campaign
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Design and schedule your next email campaign
                      </p>
                    </div>
                  </div>
                  {!sessionValid && (
                    <div className="mt-3 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                      ⚠️ Session issue detected. Please refresh your session before creating campaigns.
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <EmailCampaignForm adminId={profile.id} onCampaignCreated={handleCampaignCreated} />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-secondary/10 via-accent/10 to-primary/10 px-6 py-5 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <BarChart className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Campaign Dashboard
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Monitor performance and manage your email campaigns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <CampaignList adminId={profile.id} key={campaignListKey} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="template-settings">
            <div className="max-w-6xl mx-auto">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Email Template Studio
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Customize your email templates with advanced branding and styling options
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <TemplateSettingsTab adminId={profile.id} />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scholarship-scraper">
            <div className="max-w-6xl mx-auto">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-10 via-green-10 to-purple-10 px-8 py-6 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Scholarship Data Scraper
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Automatically discover and import scholarships from multiple sources using AI enhancement
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <ScholarshipScraperTab adminId={profile.id} />
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Navigate } from "react-router-dom";
import { CampaignList } from "@/components/admin/CampaignList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailCampaignForm from "@/components/admin/email-campaign-form/EmailCampaignForm";
import { TemplateSettingsTab } from "@/components/admin/email-templates/TemplateSettingsTab";
import { useEmailCampaignAnalytics } from "@/hooks/useEmailCampaignAnalytics";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Mail, Settings, TrendingUp, Users, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function AdminEmailCampaigns() {
  const { session, refreshSession } = useAuthSession();
  const { data: profile, isLoading: profileLoading } = useUserProfile(session);
  const [activeTab, setActiveTab] = useState("campaigns");
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
      const { data, error } = await supabase.auth.getSession();
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container py-6 space-y-8">
        {authError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Warning</AlertTitle>
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

        {/* Modern Header Section */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
              <div className="relative bg-gradient-to-r from-primary to-secondary p-4 rounded-2xl shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-secondary bg-clip-text text-transparent">
              Email Campaign Hub
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create, manage, and track your email campaigns with powerful analytics and customizable templates
            </p>
          </div>

          {/* Real Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-blue-600 font-medium">Success Rate</p>
                <p className="text-xl font-bold text-blue-800">
                  {analytics.isLoading ? "..." : `${analytics.successRate}%`}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Send className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-green-600 font-medium">Campaigns Sent</p>
                <p className="text-xl font-bold text-green-800">
                  {analytics.isLoading ? "..." : analytics.campaignsSent.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-purple-600 font-medium">Total Reach</p>
                <p className="text-xl font-bold text-purple-800">
                  {analytics.isLoading ? "..." : analytics.totalReach.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white/60 backdrop-blur-sm shadow-lg border border-gray-200/50 p-1">
              <TabsTrigger 
                value="campaigns" 
                className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Mail className="h-4 w-4" />
                Campaign Manager
              </TabsTrigger>
              <TabsTrigger 
                value="template-settings" 
                className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Settings className="h-4 w-4" />
                Template Studio
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="campaigns">
            {/* New Layout: 2 columns for form, 3 columns for campaigns */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* Compact Campaign Creation Form */}
              <div className="xl:col-span-2">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden sticky top-6">
                  <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 px-6 py-5 border-b border-gray-100/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Create Campaign
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Design and schedule your next campaign
                        </p>
                      </div>
                    </div>
                    {!sessionValid && (
                      <div className="mt-3 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                        ⚠️ Session issue detected. Please refresh your session before creating campaigns.
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <EmailCampaignForm
                      adminId={profile.id}
                      onCampaignCreated={handleCampaignCreated}
                    />
                  </div>
                </Card>
              </div>

              {/* Expanded Campaign List */}
              <div className="xl:col-span-3">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-secondary/10 via-accent/10 to-primary/10 px-6 py-5 border-b border-gray-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Campaign Dashboard
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Monitor performance and manage campaigns
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <CampaignList 
                      adminId={profile.id} 
                      key={campaignListKey} 
                    />
                  </div>
                </Card>
              </div>
            </div>
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
        </Tabs>
      </div>
    </div>
  );
}

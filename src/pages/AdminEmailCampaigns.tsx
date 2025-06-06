
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
import { AlertCircle, RefreshCw, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function AdminEmailCampaigns() {
  const { session, refreshSession } = useAuthSession();
  const { data: profile, isLoading: profileLoading } = useUserProfile(session);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [campaignListKey, setCampaignListKey] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-8">
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

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Email Campaign Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create, manage, and track your email campaigns with powerful analytics and customizable templates
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white shadow-sm border border-gray-200">
              <TabsTrigger value="campaigns" className="flex items-center gap-2 px-6 py-3">
                <Mail className="h-4 w-4" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="template-settings" className="flex items-center gap-2 px-6 py-3">
                <Settings className="h-4 w-4" />
                Template Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="campaigns">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Campaign Creation Form */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-8 py-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Create New Campaign
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Design and schedule your email campaign
                    </p>
                    {!sessionValid && (
                      <div className="mt-3 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded">
                        ⚠️ Session issue detected. Please refresh your session before creating campaigns.
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <EmailCampaignForm
                      adminId={profile.id}
                      onCampaignCreated={handleCampaignCreated}
                    />
                  </div>
                </div>
              </div>

              {/* Campaign List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-secondary/5 to-accent/5 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Campaigns
                    </h3>
                  </div>
                  <div className="p-6">
                    <CampaignList 
                      adminId={profile.id} 
                      key={campaignListKey} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="template-settings">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-8 py-6 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Email Template Settings
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Customize your email templates with branding and styling options
                  </p>
                </div>
                <div className="p-8">
                  <TemplateSettingsTab adminId={profile.id} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

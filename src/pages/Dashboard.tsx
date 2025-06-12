
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield } from "lucide-react";
import { DashboardTab } from "@/components/profile/dashboard/tabs/DashboardTab";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { session, loading: sessionLoading } = useAuthSession();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile(session);

  // Always call all hooks in the same order
  const isLoading = sessionLoading || profileLoading;
  const isAdmin = profile?.user_type === 'admin';
  const hasProfile = !!profile;
  const hasSession = !!session;

  // Single return with conditional rendering
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your account, content, and administrative tasks
          </p>
        </div>

        {isLoading && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && !hasSession && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to be logged in to access the dashboard.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && hasSession && profileError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading profile data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && hasSession && !hasProfile && !profileError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profile not found. Please complete your profile setup.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && hasSession && !isAdmin && hasProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Restricted
              </CardTitle>
              <CardDescription>
                This dashboard is only available to administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you believe you should have access to this area, please contact support.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && hasSession && isAdmin && hasProfile && (
          <DashboardTab />
        )}
      </div>
    </div>
  );
}

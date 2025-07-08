import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Key, FileText, BarChart3, Users, Activity } from "lucide-react";
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute";
import { OrganizationManagement } from "@/components/api-admin/OrganizationManagement";
import { APIKeyManagement } from "@/components/api-admin/APIKeyManagement";
import { TemplateBuilder } from "@/components/api-admin/TemplateBuilder";
import { AnalyticsDashboard } from "@/components/api-admin/AnalyticsDashboard";
import { SessionMonitoring } from "@/components/api-admin/SessionMonitoring";
import { QuotaManagement } from "@/components/api-admin/QuotaManagement";

export default function APIAdmin() {
  const [activeTab, setActiveTab] = useState("organizations");

  return (
    <ProtectedAdminRoute>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Administration</h1>
          <p className="text-muted-foreground">
            Manage organizations, templates, and monitor API usage
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="quotas" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Quotas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Management</CardTitle>
              <CardDescription>
                Create and manage API organizations and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Generate and manage API keys for organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <APIKeyManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Template Builder</CardTitle>
              <CardDescription>
                Create and manage assessment templates with visual builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateBuilder />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Monitoring</CardTitle>
              <CardDescription>
                Monitor active sessions and track completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionMonitoring />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quota Management</CardTitle>
              <CardDescription>
                Manage API quotas and usage limits for organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuotaManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ProtectedAdminRoute>
  );
}
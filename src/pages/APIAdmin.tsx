import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Key, FileText, BarChart3, Users, Activity, Layers, Globe, Palette, Cog, Code, Webhook } from "lucide-react";
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute";
import { OrganizationManagement } from "@/components/api-admin/OrganizationManagement";
import { APIKeyManagement } from "@/components/api-admin/APIKeyManagement";
import { TemplateBuilder } from "@/components/api-admin/TemplateBuilder";
import { AnalyticsDashboard } from "@/components/api-admin/AnalyticsDashboard";
import { AdvancedAnalyticsDashboard } from "@/components/api-admin/AdvancedAnalyticsDashboard";
import { SessionMonitoring } from "@/components/api-admin/SessionMonitoring";
import { QuotaManagement } from "@/components/api-admin/QuotaManagement";
import { BulkManagement } from "@/components/api-admin/BulkManagement";
import { WhiteLabelSettings } from "@/components/api-admin/WhiteLabelSettings";
import { AdvancedScoringEngine } from "@/components/api-admin/AdvancedScoringEngine";
import { MultiLanguageManager } from "@/components/api-admin/MultiLanguageManager";
import { WebhookManagement } from "@/components/api-admin/WebhookManagement";
import { IntegrationDemos } from "@/components/api-admin/IntegrationDemos";
import { AuthDebug } from "@/components/debug/AuthDebug";

export default function APIAdmin() {
  const [activeTab, setActiveTab] = useState("debug");

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
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-12 min-w-max">
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Debug
            </TabsTrigger>
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
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Bulk
            </TabsTrigger>
            <TabsTrigger value="white-label" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Scoring
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Languages
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Demos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="debug" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication & API Debug</CardTitle>
              <CardDescription>
                Debug authentication status and test API connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthDebug />
            </CardContent>
          </Card>
        </TabsContent>

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
          <AdvancedAnalyticsDashboard />
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

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>
                Perform batch operations on assessments, templates, and users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="white-label" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>White-Label Customization</CardTitle>
              <CardDescription>
                Customize branding, themes, and appearance for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WhiteLabelSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Scoring Engine</CardTitle>
              <CardDescription>
                Configure AI-powered scoring algorithms and career matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedScoringEngine />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Language Support</CardTitle>
              <CardDescription>
                Manage translations and language settings for global deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultiLanguageManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Management</CardTitle>
              <CardDescription>
                Configure webhooks for real-time event notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebhookManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Examples & Demos</CardTitle>
              <CardDescription>
                Code examples, live demos, and integration guides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationDemos />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ProtectedAdminRoute>
  );
}
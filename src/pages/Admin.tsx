
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, BarChart3, Shield } from 'lucide-react';
import { OrganizationManagement } from '@/components/admin/OrganizationManagement';

export function Admin() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, content, and system settings
        </p>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
          <OrganizationManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>
                Overview of platform usage and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Analytics dashboard will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure platform-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Settings management will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Management</CardTitle>
              <CardDescription>
                Monitor security events and manage access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Security management tools will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

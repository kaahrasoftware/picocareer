import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Trash2, Key, Palette, Globe, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrganizationSettingsProps {
  organization: any;
}

export function OrganizationSettings({ organization }: OrganizationSettingsProps) {
  const [settings, setSettings] = useState({
    name: organization.name || '',
    contactEmail: organization.contact_email || '',
    contactName: organization.contact_name || '',
    domain: organization.domain || '',
    webhookUrl: '',
    emailNotifications: true,
    apiNotifications: true,
    securityAlerts: true,
    brandingEnabled: false,
    customDomain: '',
    primaryColor: '#3B82F6',
    logoUrl: ''
  });

  const { toast } = useToast();

  const handleSave = () => {
    // Implementation for saving organization settings
    toast({
      title: "Settings Saved",
      description: "Your organization settings have been updated successfully.",
    });
  };

  const handleDeleteOrganization = () => {
    // Implementation for deleting organization
    toast({
      title: "Organization Deleted",
      description: "Your organization has been permanently deleted.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization preferences and configurations</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="contact-name">Contact Name</Label>
                  <Input
                    id="contact-name"
                    value={settings.contactName}
                    onChange={(e) => setSettings({...settings, contactName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Primary Domain</Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={settings.domain}
                    onChange={(e) => setSettings({...settings, domain: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure API-related settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-app.com/webhooks/picocareer"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Receive real-time notifications for assessment events
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API Usage Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when approaching usage limits
                  </p>
                </div>
                <Switch
                  checked={settings.apiNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, apiNotifications: checked})}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for security-related events
                  </p>
                </div>
                <Switch
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) => setSettings({...settings, securityAlerts: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>White-label Branding</CardTitle>
              <CardDescription>
                Customize the appearance of assessments with your brand
                <Badge variant="outline" className="ml-2">Pro Feature</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Branding</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply your custom branding to assessments
                  </p>
                </div>
                <Switch
                  checked={settings.brandingEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, brandingEnabled: checked})}
                  disabled={organization.subscription_tier === 'free'}
                />
              </div>
              
              {settings.brandingEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="logo-url">Logo URL</Label>
                    <Input
                      id="logo-url"
                      placeholder="https://your-domain.com/logo.png"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                        className="w-20"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="custom-domain">Custom Domain</Label>
                    <Input
                      id="custom-domain"
                      placeholder="assessments.your-domain.com"
                      value={settings.customDomain}
                      onChange={(e) => setSettings({...settings, customDomain: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <Badge variant="outline">Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Enable 2FA
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">API Rate Limiting</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Current rate limit: 60 requests per minute
                </p>
                <Button variant="outline" size="sm">
                  Configure Limits
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-destructive rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Delete Organization</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your organization and all associated data. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Organization
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        organization, all API keys, templates, and assessment data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteOrganization}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
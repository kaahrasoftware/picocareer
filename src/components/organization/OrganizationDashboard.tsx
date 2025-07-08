import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrganizationSidebar } from './OrganizationSidebar';
import { OrganizationOverview } from './dashboard/OrganizationOverview';
import { APIManagement } from './dashboard/APIManagement';
import { TemplateManagement } from './dashboard/TemplateManagement';
import { UserAnalytics } from './dashboard/UserAnalytics';
import { UsageBilling } from './dashboard/UsageBilling';
import { OrganizationSettings } from './dashboard/OrganizationSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Menu, X } from 'lucide-react';

interface OrganizationDashboardProps {
  organization: any;
}

export function OrganizationDashboard({ organization }: OrganizationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your organization portal.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', component: OrganizationOverview },
    { id: 'api', label: 'API Management', component: APIManagement },
    { id: 'templates', label: 'Templates', component: TemplateManagement },
    { id: 'analytics', label: 'User Analytics', component: UserAnalytics },
    { id: 'billing', label: 'Usage & Billing', component: UsageBilling },
    { id: 'settings', label: 'Settings', component: OrganizationSettings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || OrganizationOverview;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center space-x-4 flex-1">
            <h1 className="text-lg font-semibold text-primary">PicoCareer Portal</h1>
            <Badge variant="outline">{organization.name}</Badge>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <OrganizationSidebar
          isOpen={sidebarOpen}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={() => setSidebarOpen(false)}
          organization={organization}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <ActiveComponent organization={organization} />
        </main>
      </div>
    </div>
  );
}
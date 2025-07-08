import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Key, 
  FileText, 
  Users, 
  CreditCard, 
  Settings, 
  LayoutDashboard,
  X
} from 'lucide-react';

interface OrganizationSidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
  organization: any;
}

export function OrganizationSidebar({ isOpen, activeTab, onTabChange, onClose, organization }: OrganizationSidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'api', label: 'API Management', icon: Key },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'analytics', label: 'User Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Usage & Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-full w-64 transform border-r bg-card transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4 lg:justify-center">
          <h2 className="font-semibold text-foreground">Organization Portal</h2>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          {/* Organization Info */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-medium text-sm text-foreground mb-1">{organization.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {organization.subscription_tier || 'Free'}
              </Badge>
            </CardContent>
          </Card>

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    activeTab === item.id && "bg-primary/10 text-primary"
                  )}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
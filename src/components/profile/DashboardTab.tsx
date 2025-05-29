
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen,
  GraduationCap,
  Settings,
  Bug
} from "lucide-react";
import { OverviewTab } from "./dashboard/tabs/OverviewTab";
import { UsersTab } from "./dashboard/tabs/UsersTab";
import { AppSettingsTab } from "./dashboard/tabs/AppSettingsTab";
import { AcademicResourcesTab } from "./dashboard/tabs/AcademicResourcesTab";
import { ContentResourcesTab } from "./dashboard/tabs/ContentResourcesTab";
import { BrowserCompatibilityTest } from "../debug/BrowserCompatibilityTest";

export function DashboardTab() {
  return (
    <div className="space-y-8 p-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-6 gap-4">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="academic-resources" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Academic Resources
          </TabsTrigger>
          <TabsTrigger value="content-resources" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Content Resources
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            App Settings
          </TabsTrigger>
          <TabsTrigger value="debug" className="gap-2">
            <Bug className="h-4 w-4" />
            Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="academic-resources">
          <AcademicResourcesTab />
        </TabsContent>

        <TabsContent value="content-resources">
          <ContentResourcesTab />
        </TabsContent>

        <TabsContent value="settings">
          <AppSettingsTab />
        </TabsContent>

        <TabsContent value="debug">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Debug Tools</h2>
            <BrowserCompatibilityTest />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

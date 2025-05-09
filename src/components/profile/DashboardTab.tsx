
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen,
  GraduationCap,
  Settings
} from "lucide-react";
import { OverviewTab } from "./dashboard/tabs/OverviewTab";
import { UsersTab } from "./dashboard/tabs/UsersTab";
import { AppSettingsTab } from "./dashboard/tabs/AppSettingsTab";
import { AcademicResourcesTab } from "./dashboard/tabs/AcademicResourcesTab";
import { ContentResourcesTab } from "./dashboard/tabs/ContentResourcesTab";

export function DashboardTab() {
  return (
    <div className="space-y-8 p-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 gap-4">
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
      </Tabs>
    </div>
  );
}


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen,
  GraduationCap,
  Settings,
  Calendar,
  CalendarClock
} from "lucide-react";
import { OverviewTab } from "./OverviewTab";
import { UsersTab } from "./UsersTab";
import { AppSettingsTab } from "./AppSettingsTab";
import { AcademicResourcesTab } from "./AcademicResourcesTab";
import { ContentResourcesTab } from "./ContentResourcesTab";
import { EventManagementTab } from "./EventManagementTab";
import { SessionManagementTab } from "./sessions/SessionManagementTab";

export function DashboardTab() {
  return (
    <div className="space-y-8 p-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-7 gap-4">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span>Events</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <CalendarClock className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="academic-resources" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Academic Resources</span>
          </TabsTrigger>
          <TabsTrigger value="content-resources" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Content Resources</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="events">
          <EventManagementTab />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManagementTab />
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

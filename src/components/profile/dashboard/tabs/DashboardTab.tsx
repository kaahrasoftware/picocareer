
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen,
  GraduationCap,
  Settings,
  Bug,
  Coins,
  Calendar,
  CalendarDays
} from "lucide-react";
import { OverviewTab } from "./OverviewTab";
import { UsersTab } from "./UsersTab";
import { AppSettingsTab } from "./AppSettingsTab";
import { AcademicResourcesTab } from "./AcademicResourcesTab";
import { ContentResourcesTab } from "./ContentResourcesTab";
import { TokensManagementTab } from "./tokens/TokensManagementTab";
import { SessionManagementTab } from "./sessions/SessionManagementTab";
import { EventManagementTab } from "./events/EventManagementTab";


export function DashboardTab() {
  return (
    <div className="space-y-8 p-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-9 gap-4">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="tokens" className="gap-2">
            <Coins className="h-4 w-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Calendar className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Events
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

        <TabsContent value="tokens">
          <TokensManagementTab />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManagementTab />
        </TabsContent>

        <TabsContent value="events">
          <EventManagementTab />
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
            <p className="text-muted-foreground">Debug tools will be available here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

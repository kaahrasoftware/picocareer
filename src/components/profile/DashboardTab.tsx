
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Briefcase,
  School,
  BookOpen,
  Video,
  Award,
  Settings
} from "lucide-react";
import { OverviewTab } from "./dashboard/tabs/OverviewTab";
import { UsersTab } from "./dashboard/tabs/UsersTab";
import { AppSettingsTab } from "./dashboard/tabs/AppSettingsTab";

export function DashboardTab() {
  return (
    <div className="space-y-8 p-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-9 gap-4">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="majors" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Majors
          </TabsTrigger>
          <TabsTrigger value="careers" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Careers
          </TabsTrigger>
          <TabsTrigger value="schools" className="gap-2">
            <School className="h-4 w-4" />
            Schools
          </TabsTrigger>
          <TabsTrigger value="blogs" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Blogs
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="gap-2">
            <Award className="h-4 w-4" />
            Scholarships
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

        <TabsContent value="majors">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Majors Management</h2>
            {/* Add majors management UI */}
          </div>
        </TabsContent>

        <TabsContent value="careers">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Careers Management</h2>
            {/* Add careers management UI */}
          </div>
        </TabsContent>

        <TabsContent value="schools">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Schools Management</h2>
            {/* Add schools management UI */}
          </div>
        </TabsContent>

        <TabsContent value="blogs">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Blogs Management</h2>
            {/* Add blogs management UI */}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Videos Management</h2>
            {/* Add videos management UI */}
          </div>
        </TabsContent>

        <TabsContent value="scholarships">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Scholarships Management</h2>
            {/* Add scholarships management UI */}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <AppSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

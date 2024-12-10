import { Sidebar } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bell, Settings } from "lucide-react";

export function ProfileSidebar() {
  return (
    <Sidebar side="right">
      <div className="flex flex-col h-full bg-kahra-darker border-l border-kahra-dark/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Profile</h2>
            <SidebarTrigger className="text-gray-400 hover:text-white transition-colors" />
          </div>
          
          <div className="space-y-6">
            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/avatars/user.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">John Doe</h3>
                <p className="text-sm text-gray-400">Student</p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Profile Completion</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>

            {/* Interests */}
            <div>
              <h4 className="text-sm font-medium mb-3">Interests</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Technology</Badge>
                <Badge variant="secondary">Healthcare</Badge>
                <Badge variant="secondary">Education</Badge>
                <Badge variant="secondary">Business</Badge>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
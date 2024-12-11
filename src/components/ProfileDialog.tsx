import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileTab } from "./profile/ProfileTab";
import { DashboardTab } from "./profile/DashboardTab";
import { SettingsTab } from "./profile/SettingsTab";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    } else {
      toast({
        title: "Success",
        description: "You have been logged out.",
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-kahra-darker text-white overflow-y-auto overflow-x-hidden">
        <ProfileHeader />

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-border">
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="w-full">
            <TabsContent value="profile" className="mt-4">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="dashboard" className="mt-4">
              <DashboardTab />
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-6 border-t border-border pt-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
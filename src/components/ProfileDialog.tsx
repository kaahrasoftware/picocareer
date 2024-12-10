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

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
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
          </TabsList>

          <div className="w-full">
            <TabsContent value="profile" className="mt-4">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="dashboard" className="mt-4">
              <DashboardTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
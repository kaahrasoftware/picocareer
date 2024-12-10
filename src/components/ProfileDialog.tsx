import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileTab } from "./profile/ProfileTab";
import { CalendarTab } from "./profile/CalendarTab";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-background text-foreground dark:bg-kahra-darker dark:text-white">
        <DialogHeader>
          <ProfileHeader />
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-border">
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-transparent data-[state=active]:text-foreground dark:data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="calendar"
              className="data-[state=active]:bg-transparent data-[state=active]:text-foreground dark:data-[state=active]:text-white"
            >
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <CalendarTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
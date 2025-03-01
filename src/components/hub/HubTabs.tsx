
import { Hub } from "@/types/database/hubs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HubResources } from "./HubResources";
import { HubAnnouncements } from "./HubAnnouncements";
import { HubMembers } from "./HubMembers";
import { HubDepartments } from "./HubDepartments";
import { HubManagement } from "./management/HubManagement";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { HubOverviewSection } from "./overview/HubOverviewSection";
import { HubChat } from "./chat/HubChat";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface HubTabsProps {
  hub: Hub;
  isMember: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isUnconfirmedMember: boolean;
  hubStats: {
    membersCount: number;
    resourcesCount: number;
  } | null;
}

export function HubTabs({
  hub,
  isMember,
  isAdmin,
  isModerator,
  isUnconfirmedMember,
  hubStats
}: HubTabsProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfirming, setIsConfirming] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  const handleConfirmMembership = async () => {
    try {
      setIsConfirming(true);
      
      const { data, error } = await supabase.rpc('confirm_hub_membership', {
        _hub_id: hub.id
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        toast({
          title: "Membership Confirmed",
          description: data.message || `You have confirmed your membership in ${hub.name}`,
        });
        
        // Refresh hub data and member status
        queryClient.invalidateQueries({ queryKey: ['hub', hub.id] });
        queryClient.invalidateQueries({ queryKey: ['hub-member-role', hub.id] });
        queryClient.invalidateQueries({ queryKey: ['hub-pending-members', hub.id] });
        
        // Show welcome dialog
        setShowWelcomeDialog(true);
      } else {
        toast({
          title: "Error",
          description: data?.message || "Failed to confirm membership",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error confirming membership:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm membership",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return <>
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        {session && <TabsTrigger value="chat">Channels</TabsTrigger>}
        {isMember && <>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="departments">Communities</TabsTrigger>
          </>}
        {isAdmin && <TabsTrigger value="manage">Manage</TabsTrigger>}
        {isUnconfirmedMember && <TabsTrigger value="confirmation">Confirmation</TabsTrigger>}
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <HubOverviewSection hub={hub} hubStats={hubStats} />
        {!isMember && !isUnconfirmedMember && <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Join this hub to access announcements, resources, members list, and departments.
            </AlertDescription>
          </Alert>}
      </TabsContent>

      {session && <TabsContent value="chat" className="mt-6">
          {!isMember && <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can participate in public chat rooms. Join this hub to access private chat rooms as well.
              </AlertDescription>
            </Alert>}
          <HubChat hubId={hub.id} isAdmin={isAdmin} isModerator={isModerator} />
        </TabsContent>}

      {isMember && <>
          <TabsContent value="announcements" className="mt-6">
            <HubAnnouncements hubId={hub.id} isAdmin={isAdmin} isModerator={isModerator} />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <HubResources hubId={hub.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <HubMembers hubId={hub.id} />
          </TabsContent>

          <TabsContent value="departments" className="mt-6">
            <HubDepartments hubId={hub.id} isAdmin={isAdmin} isModerator={isModerator} />
          </TabsContent>
        </>}

      {isAdmin && <TabsContent value="manage" className="mt-6">
          <HubManagement hub={hub} />
        </TabsContent>}
        
      {isUnconfirmedMember && <TabsContent value="confirmation" className="mt-6">
          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-white shadow-sm">
              <div className="flex flex-col items-center text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-emerald-500" />
                <h2 className="text-2xl font-semibold">Confirm Your Membership</h2>
                <p className="text-muted-foreground max-w-md">
                  You've been invited to join {hub.name}. Confirm your membership to get full access to all content and features.
                </p>
                <Button 
                  onClick={handleConfirmMembership} 
                  disabled={isConfirming}
                  size="lg"
                  className="mt-4"
                >
                  {isConfirming ? "Confirming..." : "Confirm Membership"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>}
    </Tabs>

    {/* Welcome Dialog */}
    <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to {hub.name}!</DialogTitle>
          <DialogDescription>
            Your membership has been confirmed. You now have access to all hub features and content.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
            <p className="text-sm text-muted-foreground">
              You can now access announcements, resources, member directories, and participate in community discussions. Explore the different tabs to get started.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setShowWelcomeDialog(false)} className="w-full">
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}

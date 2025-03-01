import { Hub } from "@/types/database/hubs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HubResources } from "./HubResources";
import { HubAnnouncements } from "./HubAnnouncements";
import { HubMembers } from "./HubMembers";
import { HubDepartments } from "./HubDepartments";
import { HubManagement } from "./management/HubManagement";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { HubOverviewSection } from "./overview/HubOverviewSection";
import { HubChat } from "./chat/HubChat";
import { useAuthSession } from "@/hooks/useAuthSession";
interface HubTabsProps {
  hub: Hub;
  isMember: boolean;
  isAdmin: boolean;
  isModerator: boolean;
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
  hubStats
}: HubTabsProps) {
  const {
    session
  } = useAuthSession();
  return <Tabs defaultValue="overview" className="w-full">
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
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <HubOverviewSection hub={hub} hubStats={hubStats} />
        {!isMember && <Alert className="mt-6">
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
    </Tabs>;
}
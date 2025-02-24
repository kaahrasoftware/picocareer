
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HubGeneralSettings } from "./HubGeneralSettings";
import { HubMemberManagement } from "./HubMemberManagement";
import { HubActivityLogs } from "./HubActivityLogs";
import { HubAnalytics } from "./analytics/HubAnalytics";
import type { Hub } from "@/types/database/hubs";

interface HubManagementProps {
  hub: Hub;
}

export function HubManagement({ hub }: HubManagementProps) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="general">General Settings</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="analytics">Insights</TabsTrigger>
        <TabsTrigger value="activity">Activity Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4 mt-6">
        <HubGeneralSettings hub={hub} />
      </TabsContent>

      <TabsContent value="members" className="space-y-4 mt-6">
        <HubMemberManagement hubId={hub.id} />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4 mt-6">
        <HubAnalytics hubId={hub.id} />
      </TabsContent>

      <TabsContent value="activity" className="space-y-4 mt-6">
        <HubActivityLogs hubId={hub.id} />
      </TabsContent>
    </Tabs>
  );
}

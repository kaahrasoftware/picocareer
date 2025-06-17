
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventResourceAnalytics } from "./EventResourceAnalytics";

export function EventManagementTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Event Management</h2>
        <p className="text-muted-foreground">
          Manage events and analyze resource engagement
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Resource Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <EventResourceAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

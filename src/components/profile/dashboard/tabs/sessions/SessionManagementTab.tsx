
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionsDataTable } from "./SessionsDataTable";
import { SessionMetricCards } from "./SessionMetricCards";
import { useAdminSessionsQuery } from "@/hooks/useAdminSessionsQuery";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, CheckCircle, AlertCircle, CalendarX, Calendar } from "lucide-react";

export function SessionManagementTab() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: sessions, isLoading } = useAdminSessionsQuery(statusFilter);
  
  const sessionStats = {
    total: sessions?.length || 0,
    completed: sessions?.filter(s => s.status === "completed")?.length || 0, 
    scheduled: sessions?.filter(s => s.status === "scheduled")?.length || 0,
    cancelled: sessions?.filter(s => s.status === "cancelled")?.length || 0,
    noShow: sessions?.filter(s => s.status === "no-show")?.length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Session Management</h2>
        <Badge variant="outline" className="text-sm">
          {sessionStats.total} Total Sessions
        </Badge>
      </div>
      
      <SessionMetricCards stats={sessionStats} />
      
      <Tabs 
        defaultValue="all" 
        className="w-full"
        onValueChange={setStatusFilter}
      >
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all" className="flex gap-2 items-center">
            <Calendar className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex gap-2 items-center">
            <Clock className="h-4 w-4" />
            <span>Upcoming</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex gap-2 items-center">
            <CheckCircle className="h-4 w-4" />
            <span>Completed</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex gap-2 items-center">
            <CalendarX className="h-4 w-4" />
            <span>Cancelled</span>
          </TabsTrigger>
          <TabsTrigger value="no-show" className="flex gap-2 items-center">
            <AlertCircle className="h-4 w-4" />
            <span>No-shows</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <SessionsDataTable sessions={sessions || []} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="scheduled">
          <SessionsDataTable 
            sessions={sessions?.filter(s => s.status === "scheduled") || []} 
            isLoading={isLoading} 
          />
        </TabsContent>
        <TabsContent value="completed">
          <SessionsDataTable 
            sessions={sessions?.filter(s => s.status === "completed") || []} 
            isLoading={isLoading} 
          />
        </TabsContent>
        <TabsContent value="cancelled">
          <SessionsDataTable 
            sessions={sessions?.filter(s => s.status === "cancelled") || []} 
            isLoading={isLoading} 
          />
        </TabsContent>
        <TabsContent value="no-show">
          <SessionsDataTable 
            sessions={sessions?.filter(s => s.status === "no-show") || []} 
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

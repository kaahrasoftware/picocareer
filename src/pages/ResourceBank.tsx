
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventResourceTable } from "@/components/event/EventResourceTable";
import { EventResourceForm } from "@/components/event/EventResourceForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventResourceMetrics } from "@/components/profile/dashboard/tabs/events/EventResourceMetrics";

export default function ResourceBank() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAccess, setFilterAccess] = useState<string>("all");

  // Fetch all event resources from all events
  const { data: resources = [], isLoading, refetch } = useQuery({
    queryKey: ['all-event-resources', searchTerm, filterType, filterAccess],
    queryFn: async () => {
      let query = supabase
        .from('event_resources')
        .select(`
          *,
          events!inner(
            id,
            title,
            start_time,
            organized_by
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      if (filterType !== 'all') {
        query = query.eq('resource_type', filterType);
      }
      
      if (filterAccess !== 'all') {
        query = query.eq('access_level', filterAccess);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    },
  });

  // Calculate resource statistics
  const totalResources = resources.length;
  const downloadableResources = resources.filter(r => r.is_downloadable).length;
  const publicResources = resources.filter(r => r.access_level === 'public').length;
  const uniqueEvents = new Set(resources.map(r => r.event_id)).size;

  const resourceTypeStats = resources.reduce((acc, resource) => {
    acc[resource.resource_type] = (acc[resource.resource_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Resource Bank</h1>
          <p className="text-muted-foreground">
            Access all event resources in one centralized location
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResources}</div>
              <p className="text-xs text-muted-foreground">
                From {uniqueEvents} events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloadable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{downloadableResources}</div>
              <p className="text-xs text-muted-foreground">
                {totalResources > 0 ? Math.round((downloadableResources / totalResources) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publicResources}</div>
              <p className="text-xs text-muted-foreground">
                Available to everyone
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Common Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {Object.entries(resourceTypeStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {Object.entries(resourceTypeStats).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} resources
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">All Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="presentation">Presentations</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="link">Links</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterAccess} onValueChange={setFilterAccess}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Access Levels</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="registered">Registered Users</SelectItem>
                  <SelectItem value="participants_only">Participants Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>

          {/* Resource Type Filter Badges */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(resourceTypeStats).map(([type, count]) => (
              <Badge key={type} variant="secondary" className="capitalize">
                {type}: {count}
              </Badge>
            ))}
          </div>

          {/* Resources Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading resources...</div>
                </div>
              ) : resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-2">
                  <div className="text-muted-foreground">No resources found</div>
                  <Button onClick={() => setShowAddDialog(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first resource
                  </Button>
                </div>
              ) : (
                <EventResourceTable 
                  eventId="all" 
                  resources={resources}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <EventResourceMetrics />
        </TabsContent>
      </Tabs>

      {/* Add Resource Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
          </DialogHeader>
          <EventResourceForm 
            eventId=""
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

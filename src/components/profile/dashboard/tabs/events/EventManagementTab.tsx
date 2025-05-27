
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventDetailsDialog } from './EventDetailsDialog';
import { EventDashboardStats } from './EventDashboardStats';
import { EventSummaryTab } from './EventSummaryTab';
import { EventRegistrationsTab } from './EventRegistrationsTab';
import { EventResourcesManagementTab } from './EventResourcesManagementTab';
import { EventManagementGrid } from './EventManagementGrid';

export function EventManagementTab() {
  const navigate = useNavigate();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("events");

  const handleAddNewEvent = () => {
    navigate('/event/upload');
  };

  const handleViewDetails = (event: any) => {
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventSelect = (event: any) => {
    setSelectedEvent(event);
    // Switch to resources tab when an event is selected for resource management
    setActiveTab("resources");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <Button onClick={handleAddNewEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Event
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="resources">Event Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <EventSummaryTab />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <EventDashboardStats />

          <EventManagementGrid
            onViewDetails={handleViewDetails}
            onManageResources={handleEventSelect}
          />
        </TabsContent>

        <TabsContent value="registrations">
          <EventRegistrationsTab />
        </TabsContent>

        <TabsContent value="resources">
          <EventResourcesManagementTab eventId={selectedEvent?.id} />
        </TabsContent>
      </Tabs>

      {selectedEvent && (
        <EventDetailsDialog 
          event={selectedEvent} 
          isOpen={isDetailsDialogOpen} 
          onClose={handleCloseDetailsDialog} 
        />
      )}
    </div>
  );
}

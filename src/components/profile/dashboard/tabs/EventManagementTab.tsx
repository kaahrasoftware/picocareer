
import React, { useState } from 'react';
import { EventDashboardStats } from './events/EventDashboardStats';
import { EventDataTable } from './events/EventDataTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventDetailsDialog } from './events/EventDetailsDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventRegistrationsTab } from './EventRegistrationsTab';
import { EventSummaryTab } from './events/EventSummaryTab';

export function EventManagementTab() {
  const navigate = useNavigate();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <Button onClick={handleAddNewEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Event
        </Button>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <EventSummaryTab />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <EventDashboardStats />

          <Card>
            <CardContent className="p-6">
              <EventDataTable onViewDetails={handleViewDetails} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <EventRegistrationsTab />
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


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventDetailsDialog } from './EventDetailsDialog';
import { EventDataTable } from './EventDataTable';
import { EventDashboardStats } from './EventDashboardStats';
import { EventSummaryTab } from './EventSummaryTab';
import { EventRegistrationsTab } from './EventRegistrationsTab';
import { EventResourcesManagementTab } from './EventResourcesManagementTab';

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
          <TabsTrigger value="resources">Event Resources</TabsTrigger>
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

        <TabsContent value="resources">
          {selectedEvent ? (
            <EventResourcesManagementTab eventId={selectedEvent.id} />
          ) : (
            <Card className="w-full text-center py-8">
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">No Event Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Please select an event from the "Events" tab to manage its resources.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Switch to events tab - this would need tab state management
                    document.querySelector('[value="events"]')?.click();
                  }}
                >
                  Go to Events Tab
                </Button>
              </CardContent>
            </Card>
          )}
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

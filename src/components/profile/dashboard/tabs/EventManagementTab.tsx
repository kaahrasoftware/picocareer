
import React, { useState } from 'react';
import { EventDashboardStats } from './events/EventDashboardStats';
import { EventDataTable } from './events/EventDataTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventDetailsDialog } from './events/EventDetailsDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventRegistrationsTab } from './events/EventRegistrationsTab';
import { EventSummaryTab } from './events/EventSummaryTab';
import { EventEmailMonitor } from '@/components/admin/EventEmailMonitor';

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

      <Card className="min-h-[600px]">
        <CardContent className="p-6">
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger 
                value="summary" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger 
                value="events"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
              >
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="registrations"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
              >
                Registrations
              </TabsTrigger>
              <TabsTrigger 
                value="email-confirmations"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
              >
                Email Confirmations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6 min-h-[400px] bg-background rounded-lg p-6 border">
              <EventSummaryTab />
            </TabsContent>

            <TabsContent value="events" className="space-y-6 min-h-[400px] bg-background rounded-lg p-6 border">
              <EventDashboardStats />
              <Card>
                <CardHeader>
                  <CardTitle>Events Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <EventDataTable onViewDetails={handleViewDetails} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="registrations" className="space-y-6 min-h-[400px] bg-background rounded-lg p-6 border">
              <EventRegistrationsTab />
            </TabsContent>

            <TabsContent value="email-confirmations" className="space-y-6 min-h-[400px] bg-background rounded-lg p-6 border">
              <EventEmailMonitor />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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

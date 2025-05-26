
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { EventResourceCard } from '@/components/event/EventResourceCard';
import { EventResourceForm } from '@/components/event/EventResourceForm';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useEventResources } from '@/hooks/useEventResources';

interface EventResourcesManagementTabProps {
  eventId: string;
}

export const EventResourcesManagementTab: React.FC<EventResourcesManagementTabProps> = ({ eventId }) => { 
  const { resources, isLoading } = useEventResources(eventId);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  if (isLoading) {
    return <div>Loading resources...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Event Resources</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <EventResourceForm eventId={eventId} onSuccess={() => setIsFormOpen(false)} />
          </DialogContent> 
        </Dialog>
      </div>

      {resources && resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <EventResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <Card className="w-full text-center py-8">
          <CardHeader>
            <CardTitle>No Resources Found</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>There are no resources available for this event yet. Add a new resource to get started.</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

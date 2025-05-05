
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useForm, FormProvider } from 'react-hook-form';
import { FormField } from '@/components/forms/FormField';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { format } from 'date-fns';
import { RichTextEditor } from '@/components/forms/RichTextEditor';
import { Badge } from '@/components/ui/badge';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { Star } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface EventDetailsDialogProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsDialog({ event, isOpen, onClose }: EventDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const form = useForm({
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      start_time: event?.start_time ? format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm") : '',
      end_time: event?.end_time ? format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm") : '',
      event_type: event?.event_type || 'Webinar',
      platform: event?.platform || 'Google Meet',
      meeting_link: event?.meeting_link || '',
      max_attendees: event?.max_attendees || 50,
      thumbnail_url: event?.thumbnail_url || '',
      timezone: event?.timezone || 'EST',
      organized_by: event?.organized_by || '',
      facilitator: event?.facilitator || ''
    }
  });

  const handleSave = async (data: any) => {
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .update({
          ...data,
        })
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast.success('Event updated successfully');
      setIsEditMode(false);
    } catch (error: any) {
      toast.error(`Failed to update event: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const platformOptions = [
    { id: 'Google Meet', name: 'Google Meet' },
    { id: 'Zoom', name: 'Zoom' }
  ];

  const eventTypeOptions = [
    { id: 'Coffee Time', name: 'Coffee Time' },
    { id: 'Hackathon', name: 'Hackathon' },
    { id: 'Panel', name: 'Panel' },
    { id: 'Webinar', name: 'Webinar' },
    { id: 'Workshop', name: 'Workshop' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Event' : event?.title}
          </DialogTitle>
          {!isEditMode && (
            <DialogDescription>
              {new Date(event?.start_time).toLocaleString()} - {event?.event_type}
            </DialogDescription>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            {isEditMode ? (
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    label="Event Title"
                    placeholder="Enter event title"
                    required
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    label="Event Description"
                    type="richtext"
                    component={RichTextEditor}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_time"
                      label="Start Time"
                      type="datetime-local"
                      required
                    />

                    <FormField
                      control={form.control}
                      name="end_time"
                      label="End Time"
                      type="datetime-local"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="platform"
                      label="Meeting Platform"
                      type="select"
                      options={platformOptions}
                      required
                    />

                    <FormField
                      control={form.control}
                      name="event_type"
                      label="Event Category"
                      type="select"
                      options={eventTypeOptions}
                      required
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="meeting_link"
                    label="Meeting Link"
                    placeholder="Enter meeting link"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="max_attendees"
                      label="Maximum Attendees"
                      type="number"
                      placeholder="Enter maximum number of attendees"
                    />

                    <FormField
                      control={form.control}
                      name="timezone"
                      label="Timezone"
                      placeholder="Enter timezone (e.g., EST)"
                      required
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="thumbnail_url"
                    label="Event Image"
                    type="image"
                    bucket="Event_Posts"
                    component={ImageUpload}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="organized_by"
                      label="Organized By"
                      placeholder="Enter organizer name"
                    />

                    <FormField
                      control={form.control}
                      name="facilitator"
                      label="Facilitator"
                      placeholder="Enter facilitator name"
                    />
                  </div>

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditMode(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </FormProvider>
            ) : (
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  {event?.thumbnail_url ? (
                    <img 
                      src={event.thumbnail_url} 
                      alt={event.title} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image available
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Start Time</h3>
                    <p>{new Date(event?.start_time).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">End Time</h3>
                    <p>{new Date(event?.end_time).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Description</h3>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: event?.description }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Meeting Platform</h3>
                    <p>{event?.platform}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Meeting Link</h3>
                    <p>
                      {event?.meeting_link ? (
                        <a 
                          href={event.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {event.meeting_link}
                        </a>
                      ) : (
                        'No link provided'
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Maximum Attendees</h3>
                    <p>{event?.max_attendees || 'Unlimited'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Timezone</h3>
                    <p>{event?.timezone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Organized By</h3>
                    <p>{event?.organized_by || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Facilitator</h3>
                    <p>{event?.facilitator || 'Not specified'}</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={() => setIsEditMode(true)}>
                    Edit Details
                  </Button>
                </DialogFooter>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="registrations">
            <EventRegistrations eventId={event?.id} />
          </TabsContent>
          
          <TabsContent value="settings">
            <EventSettings event={event} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Component to display event registrations
function EventRegistrations({ eventId }: { eventId: string }) {
  const { data: registrations, isLoading } = usePaginatedQuery<any>({
    queryKey: ['event-registrations', eventId],
    tableName: 'event_registrations',
    paginationOptions: {
      limit: 100
    },
    filters: { event_id: eventId }
  });

  if (isLoading) {
    return <div className="py-12 text-center">Loading registrations...</div>;
  }

  if (!registrations || registrations.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No registrations for this event yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Registrations ({registrations.length})</h3>
      
      <div className="border rounded-md overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Academic Field/Position</TableHead>
              <TableHead>School/Company</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration: any) => (
              <TableRow key={registration.id} className="hover:bg-muted/50">
                <TableCell>
                  {registration.first_name} {registration.last_name}
                </TableCell>
                <TableCell>{registration.email}</TableCell>
                <TableCell>
                  {format(new Date(registration.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{registration.country || 'Not specified'}</TableCell>
                <TableCell>{registration["current academic field/position"] || 'Not specified'}</TableCell>
                <TableCell>{registration["current school/company"] || 'Not specified'}</TableCell>
                <TableCell>
                  <Badge variant={registration.status === 'registered' ? 'default' : 'outline'}>
                    {registration.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Component for event settings
function EventSettings({ event }: { event: any }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast.success(`Event status updated to ${status}`);
    } catch (error: any) {
      toast.error(`Failed to update status: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeatured = async () => {
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ featured: !event.featured })
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast.success(`Event ${event.featured ? 'removed from' : 'added to'} featured`);
    } catch (error: any) {
      toast.error(`Failed to update featured status: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-lg mb-2">Event Status</h3>
        <div className="flex gap-2">
          <Button
            variant={event.status === 'Approved' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('Approved')}
            disabled={isSaving}
          >
            Approved
          </Button>
          <Button
            variant={event.status === 'Pending' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('Pending')}
            disabled={isSaving}
          >
            Pending
          </Button>
          <Button
            variant={event.status === 'Rejected' ? 'default' : 'outline'}
            onClick={() => handleUpdateStatus('Rejected')}
            disabled={isSaving}
          >
            Rejected
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-lg mb-2">Featured Event</h3>
        <div className="flex items-center">
          <Button
            variant={event.featured ? 'default' : 'outline'}
            onClick={handleToggleFeatured}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Star className={event.featured ? 'fill-current' : ''} />
            {event.featured ? 'Featured' : 'Add to Featured'}
          </Button>
          
          <div className="ml-4 text-sm text-muted-foreground">
            Featured events appear prominently on the events page
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-lg mb-2">Event Metadata</h3>
        <div className="bg-muted p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Created At</span>
              <p>{format(new Date(event.created_at), 'PPPp')}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <p>{format(new Date(event.updated_at), 'PPPp')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

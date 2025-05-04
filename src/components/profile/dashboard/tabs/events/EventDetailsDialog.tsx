
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, Clock, Users, Video, MapPin } from 'lucide-react';

interface EventDetailsDialogProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsDialog({ event, isOpen, onClose }: EventDetailsDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {event.thumbnail_url && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <img 
                src={event.thumbnail_url} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {event.start_time ? format(new Date(event.start_time), 'PPP') : 'Date not set'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {event.start_time && event.end_time ? 
                    `${format(new Date(event.start_time), 'p')} - ${format(new Date(event.end_time), 'p')}` : 
                    'Time not set'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span>{event.platform || 'Platform not set'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{event.max_attendees ? `Max ${event.max_attendees} attendees` : 'No attendee limit'}</span>
              </div>

              {event.timezone && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.timezone}</span>
                </div>
              )}

              <div>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  {event.event_type || 'Other'}
                </span>
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  event.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                  event.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {event.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <h3>Description</h3>
            <div dangerouslySetInnerHTML={{ __html: event.description || 'No description provided.' }} />
          </div>

          {event.meeting_link && (
            <div>
              <h3 className="text-sm font-medium mb-2">Meeting Link</h3>
              <a 
                href={event.meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {event.meeting_link}
              </a>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button>Edit Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

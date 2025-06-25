
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, User, Building } from 'lucide-react';
import { format } from 'date-fns';

interface EventDetailsDialogProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsDialog({ event, isOpen, onClose }: EventDetailsDialogProps) {
  const formatTime = (time: string) => {
    return format(new Date(time), "h:mm a");
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "MMMM d, yyyy");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Type Badge */}
          <div>
            <Badge variant="outline" className="text-sm">
              {event.event_type}
            </Badge>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatDate(event.start_time)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(event.start_time)} - {formatTime(event.end_time)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.platform}</span>
              </div>
            </div>

            <div className="space-y-4">
              {event.organized_by && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-medium">Organized by:</span> {event.organized_by}
                  </span>
                </div>
              )}
              
              {event.facilitator && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-medium">Facilitator:</span> {event.facilitator}
                  </span>
                </div>
              )}
              
              {event.max_attendees && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-medium">Max Attendees:</span> {event.max_attendees}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Event Description */}
          <div>
            <h3 className="font-semibold text-lg mb-3">About This Event</h3>
            <div 
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>

          {/* Meeting Link */}
          {event.meeting_link && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Meeting Information</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Meeting link will be shared with registered participants closer to the event date.
              </p>
            </div>
          )}

          {/* Timezone Information */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Timezone:</strong> {event.timezone || 'EST'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Please make sure to check your local time for this event.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

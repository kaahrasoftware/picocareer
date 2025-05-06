
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EventDetailsDialogProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsDialog({ event, isOpen, onClose }: EventDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event?.title || "Event Details"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Start Time</h3>
              <p>{event?.start_time ? new Date(event.start_time).toLocaleString() : 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Event Type</h3>
              <p>{event?.event_type || 'Not specified'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Description</h3>
            <div className="prose prose-sm max-w-none mt-2" 
              dangerouslySetInnerHTML={{ __html: event?.description || 'No description available' }} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

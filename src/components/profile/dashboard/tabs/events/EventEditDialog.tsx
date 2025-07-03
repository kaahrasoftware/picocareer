import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: "Coffee Time" | "Hackathon" | "Panel" | "Webinar" | "Workshop";
  platform: string;
  meeting_link?: string;
  max_attendees?: number;
  organized_by?: string;
  facilitator?: string;
  timezone: string;
}

interface EventEditDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdated: () => void;
}

export function EventEditDialog({ event, open, onOpenChange, onEventUpdated }: EventEditDialogProps) {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    start_time: event.start_time,
    end_time: event.end_time,
    event_type: event.event_type || "Webinar" as const,
    platform: event.platform,
    meeting_link: event.meeting_link || "",
    max_attendees: event.max_attendees || 0,
    organized_by: event.organized_by || "",
    facilitator: event.facilitator || "",
    timezone: event.timezone
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('events')
        .update({
          ...formData,
          max_attendees: formData.max_attendees || null,
        })
        .eq('id', event.id);

      if (error) throw error;

      toast.success("Event updated successfully");
      onEventUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("Failed to update event");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="event_type">Event Type</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value: "Coffee Time" | "Hackathon" | "Panel" | "Webinar" | "Workshop") => 
                setFormData({ ...formData, event_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Coffee Time">Coffee Time</SelectItem>
                <SelectItem value="Hackathon">Hackathon</SelectItem>
                <SelectItem value="Panel">Panel</SelectItem>
                <SelectItem value="Webinar">Webinar</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="platform">Platform</Label>
            <Input
              id="platform"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="meeting_link">Meeting Link</Label>
            <Input
              id="meeting_link"
              type="url"
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_attendees">Max Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                min="1"
                value={formData.max_attendees || ""}
                onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="organized_by">Organized By</Label>
            <Input
              id="organized_by"
              value={formData.organized_by}
              onChange={(e) => setFormData({ ...formData, organized_by: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="facilitator">Facilitator</Label>
            <Input
              id="facilitator"
              value={formData.facilitator}
              onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

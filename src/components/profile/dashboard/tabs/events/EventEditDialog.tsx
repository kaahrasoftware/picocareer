
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedEvent, EventFormData } from '@/hooks/useEventManagement';
import { useToast } from '@/hooks/use-toast';

interface EventEditDialogProps {
  event: EnhancedEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<EventFormData> & { id: string }) => void;
  isLoading?: boolean;
}

const eventTypes = [
  'Webinar',
  'Workshop', 
  'Conference',
  'Seminar',
  'Panel Discussion',
  'Q&A Session',
  'Other'
];

const platforms = [
  'Google Meet',
  'Zoom',
  'Microsoft Teams',
  'Webex',
  'In-Person',
  'Hybrid',
  'Other'
];

const timezones = [
  'EST',
  'PST',
  'GMT',
  'CET',
  'JST',
  'UTC'
];

export function EventEditDialog({
  event,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: EventEditDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    event_type: '',
    platform: '',
    meeting_link: '',
    max_attendees: undefined,
    organized_by: '',
    facilitator: '',
    timezone: 'EST',
    thumbnail_url: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        event_type: event.event_type,
        platform: event.platform,
        meeting_link: event.meeting_link || '',
        max_attendees: event.max_attendees || undefined,
        organized_by: event.organized_by || '',
        facilitator: event.facilitator || '',
        timezone: event.timezone,
        thumbnail_url: event.thumbnail_url || '',
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;

    // Basic validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      toast({
        title: "Validation Error",
        description: "Start and end times are required",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      toast({
        title: "Validation Error", 
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    onSave({
      id: event.id,
      ...formData,
    });
  };

  const handleInputChange = (field: keyof EventFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter event description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="event_type">Event Type *</Label>
              <Select 
                value={formData.event_type} 
                onValueChange={(value) => handleInputChange('event_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="platform">Platform *</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(value) => handleInputChange('platform', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(value) => handleInputChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="max_attendees">Max Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees || ''}
                onChange={(e) => handleInputChange('max_attendees', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="No limit"
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="organized_by">Organized By</Label>
              <Input
                id="organized_by"
                value={formData.organized_by}
                onChange={(e) => handleInputChange('organized_by', e.target.value)}
                placeholder="Organization name"
              />
            </div>
            
            <div>
              <Label htmlFor="facilitator">Facilitator</Label>
              <Input
                id="facilitator"
                value={formData.facilitator}
                onChange={(e) => handleInputChange('facilitator', e.target.value)}
                placeholder="Facilitator name"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="meeting_link">Meeting Link</Label>
              <Input
                id="meeting_link"
                type="url"
                value={formData.meeting_link}
                onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                placeholder="https://..."
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

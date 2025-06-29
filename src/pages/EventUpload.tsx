
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormRichEditor } from '@/components/FormRichEditor';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuthSession } from '@/hooks/useAuthSession';

const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().min(1, 'Event description is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  event_type: z.enum(['webinar', 'workshop', 'conference', 'seminar', 'networking']),
  platform: z.enum(['Google Meet', 'Zoom', 'Microsoft Teams', 'Other']),
  max_attendees: z.number().min(1).optional(),
  meeting_link: z.string().url().optional().or(z.literal('')),
  facilitator: z.string().optional(),
  organized_by: z.string().optional(),
  thumbnail_url: z.string().optional(),
  timezone: z.string().default('EST'),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function EventUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthSession();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      event_type: 'webinar',
      platform: 'Google Meet',
      max_attendees: undefined,
      meeting_link: '',
      facilitator: '',
      organized_by: '',
      thumbnail_url: '',
      timezone: 'EST',
    },
  });

  const onSubmit = async (data: EventFormData) => {
    if (!session?.user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to create an event.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('events').insert([
        {
          ...data,
          author_id: session.user.id,
          status: 'Pending',
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Event created successfully.',
      });

      navigate('/profile?tab=dashboard');
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    {...field}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Event Description *</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <FormRichEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter event description"
                    uploadConfig={{
                      bucket: 'event-images',
                      folderPath: 'descriptions/',
                    }}
                  />
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Date & Time *</Label>
                <Controller
                  name="start_time"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="start_time"
                      type="datetime-local"
                      {...field}
                      className={errors.start_time ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.start_time && (
                  <p className="text-sm text-red-600">{errors.start_time.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">End Date & Time *</Label>
                <Controller
                  name="end_time"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="end_time"
                      type="datetime-local"
                      {...field}
                      className={errors.end_time ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.end_time && (
                  <p className="text-sm text-red-600">{errors.end_time.message}</p>
                )}
              </div>
            </div>

            {/* Event Type and Platform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type *</Label>
                <Controller
                  name="event_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.event_type && (
                  <p className="text-sm text-red-600">{errors.event_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Controller
                  name="platform"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Google Meet">Google Meet</SelectItem>
                        <SelectItem value="Zoom">Zoom</SelectItem>
                        <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.platform && (
                  <p className="text-sm text-red-600">{errors.platform.message}</p>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_attendees">Max Attendees</Label>
                <Controller
                  name="max_attendees"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="max_attendees"
                      type="number"
                      placeholder="Enter max attendees"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      value={field.value || ''}
                    />
                  )}
                />
                {errors.max_attendees && (
                  <p className="text-sm text-red-600">{errors.max_attendees.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_link">Meeting Link</Label>
                <Controller
                  name="meeting_link"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="meeting_link"
                      type="url"
                      placeholder="Enter meeting link"
                      {...field}
                      className={errors.meeting_link ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.meeting_link && (
                  <p className="text-sm text-red-600">{errors.meeting_link.message}</p>
                )}
              </div>
            </div>

            {/* Facilitator and Organizer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facilitator">Facilitator</Label>
                <Controller
                  name="facilitator"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="facilitator"
                      placeholder="Enter facilitator name"
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organized_by">Organized By</Label>
                <Controller
                  name="organized_by"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="organized_by"
                      placeholder="Enter organization name"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            {/* Thumbnail Image */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Event Thumbnail</Label>
              <ImageUpload
                control={control}
                name="thumbnail_url"
                label=""
                bucket="event-images"
                folderPath="thumbnails/"
                onUploadSuccess={(url) => setValue('thumbnail_url', url)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/profile?tab=dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

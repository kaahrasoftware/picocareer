
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useEventResources } from '@/hooks/useEventResources';
import { EventResourceFormData } from '@/types/event-resources';

const resourceTypeOptions = [
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Document' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'image', label: 'Image' },
  { value: 'link', label: 'Link' },
  { value: 'other', label: 'Other' },
];

const accessLevelOptions = [
  { value: 'public', label: 'Public' },
  { value: 'registered', label: 'Registered Users' },
  { value: 'participants_only', label: 'Participants Only' },
];

const formSchema = z.object({
  eventId: z.string().min(1, 'Please select an event'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  resource_type: z.enum(['video', 'audio', 'document', 'presentation', 'image', 'link', 'other']),
  file_url: z.string().optional(),
  external_url: z.string().optional(),
  file_format: z.string().optional(),
  file_size: z.number().optional(),
  is_downloadable: z.boolean(),
  access_level: z.enum(['public', 'registered', 'participants_only']),
  sort_order: z.number(),
});

type FormData = z.infer<typeof formSchema>;

interface EventResourceFormProps {
  eventId?: string;
  events?: Array<{ id: string; title: string; start_time: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventResourceForm({ eventId, events, onSuccess, onCancel }: EventResourceFormProps) {
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  
  const { addResource, isAdding } = useEventResources(selectedEventId || 'temp');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventId: eventId || '',
      title: '',
      description: '',
      resource_type: 'document',
      file_url: '',
      external_url: '',
      file_format: '',
      file_size: 0,
      is_downloadable: true,
      access_level: 'public',
      sort_order: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    const targetEventId = eventId || data.eventId;
    
    if (!targetEventId) {
      form.setError('eventId', { message: 'Please select an event' });
      return;
    }

    const resourceData: EventResourceFormData = {
      title: data.title,
      description: data.description,
      resource_type: data.resource_type,
      file_url: data.file_url,
      external_url: data.external_url,
      file_format: data.file_format,
      file_size: data.file_size,
      is_downloadable: data.is_downloadable,
      access_level: data.access_level,
      sort_order: data.sort_order,
    };

    try {
      // We need to use the correct hook for the target event
      const { addResource: targetAddResource } = useEventResources(targetEventId);
      await new Promise((resolve, reject) => {
        targetAddResource(resourceData, {
          onSuccess: resolve,
          onError: reject,
        });
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!eventId && events && (
          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Event *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedEventId(value);
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event for this resource" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {new Date(event.start_time).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter resource title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe this resource (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resource_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {resourceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="file_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File URL</FormLabel>
                <FormControl>
                  <Input placeholder="Upload or enter file URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="external_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External URL</FormLabel>
                <FormControl>
                  <Input placeholder="External link (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="file_format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File Format</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., PDF, MP4, DOCX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="access_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accessLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_downloadable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Downloadable</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Allow users to download this resource
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isAdding}>
            {isAdding ? 'Adding Resource...' : 'Add Resource'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

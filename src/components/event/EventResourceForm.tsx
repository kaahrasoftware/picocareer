
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEventResources } from '@/hooks/useEventResources';
import { EventResource } from '@/types/event-resources';
import { toast } from 'sonner';

interface EventResourceFormProps {
  eventId: string;
  initialResource?: EventResource;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventResourceForm({ eventId, initialResource, onSuccess, onCancel }: EventResourceFormProps) {
  const { addResource, updateResource, isAdding, isUpdating } = useEventResources(eventId);
  const [resourceType, setResourceType] = useState<EventResource['resource_type']>(
    initialResource?.resource_type || 'document'
  );

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: initialResource?.title || '',
      description: initialResource?.description || '',
      resource_type: initialResource?.resource_type || 'document',
      access_level: initialResource?.access_level || 'public',
      external_url: initialResource?.external_url || '',
      file_url: initialResource?.file_url || '',
      is_downloadable: initialResource?.is_downloadable ?? true,
      sort_order: initialResource?.sort_order || 0,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const resourceData = {
        ...data,
        event_id: eventId,
        resource_type: resourceType,
        uploaded_by: null, // Will be set by the backend
      };

      if (initialResource) {
        // Fix: Call mutate method instead of calling mutation object directly
        updateResource.mutate({ id: initialResource.id, ...resourceData });
      } else {
        // Fix: Call mutate method instead of calling mutation object directly
        addResource.mutate(resourceData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register('title', { required: true })}
          placeholder="Enter resource title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter resource description"
        />
      </div>

      <div>
        <Label htmlFor="resource_type">Resource Type</Label>
        <Select
          value={resourceType}
          onValueChange={(value) => {
            setResourceType(value as EventResource['resource_type']);
            setValue('resource_type', value as EventResource['resource_type']);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select resource type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="link">Link</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="access_level">Access Level</Label>
        <Select
          defaultValue={watch('access_level')}
          onValueChange={(value) => setValue('access_level', value as EventResource['access_level'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select access level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="registered">Registered Users</SelectItem>
            <SelectItem value="participants_only">Participants Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="external_url">External URL (optional)</Label>
        <Input
          id="external_url"
          {...register('external_url')}
          placeholder="https://example.com"
          type="url"
        />
      </div>

      <div>
        <Label htmlFor="file_url">File URL (optional)</Label>
        <Input
          id="file_url"
          {...register('file_url')}
          placeholder="File URL"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_downloadable"
          {...register('is_downloadable')}
        />
        <Label htmlFor="is_downloadable">Allow downloads</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isAdding || isUpdating}>
          {isAdding || isUpdating ? 'Saving...' : 'Save Resource'}
        </Button>
      </div>
    </form>
  );
}

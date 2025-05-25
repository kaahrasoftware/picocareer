
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEventResources } from "@/hooks/useEventResources";
import { EventResource, EventResourceFormData } from "@/types/event-resources";

interface EventResourceFormProps {
  eventId: string;
  initialResource?: EventResource | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventResourceForm({ 
  eventId, 
  initialResource, 
  onSuccess, 
  onCancel 
}: EventResourceFormProps) {
  const { addResource, updateResource, isAdding, isUpdating } = useEventResources(eventId);
  const [urlType, setUrlType] = useState<'file' | 'external'>(
    initialResource?.external_url ? 'external' : 'file'
  );

  const form = useForm<EventResourceFormData>({
    defaultValues: {
      title: initialResource?.title || '',
      description: initialResource?.description || '',
      resource_type: initialResource?.resource_type || 'document',
      file_url: initialResource?.file_url || '',
      external_url: initialResource?.external_url || '',
      file_format: initialResource?.file_format || '',
      is_downloadable: initialResource?.is_downloadable ?? true,
      access_level: initialResource?.access_level || 'public',
      sort_order: initialResource?.sort_order || 0,
    },
  });

  const onSubmit = (data: EventResourceFormData) => {
    const resourceData = {
      ...data,
      file_url: urlType === 'file' ? data.file_url : undefined,
      external_url: urlType === 'external' ? data.external_url : undefined,
    };

    if (initialResource) {
      updateResource({ id: initialResource.id, ...resourceData });
    } else {
      addResource(resourceData);
    }
    onSuccess?.();
  };

  const resourceTypes = [
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Document' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'image', label: 'Image' },
    { value: 'link', label: 'Link' },
    { value: 'other', label: 'Other' },
  ];

  const accessLevels = [
    { value: 'public', label: 'Public - Anyone can access' },
    { value: 'registered', label: 'Registered Users Only' },
    { value: 'participants_only', label: 'Event Participants Only' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="Enter resource description" 
                  rows={3}
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
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Resource URL</FormLabel>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={urlType === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUrlType('file')}
            >
              File URL
            </Button>
            <Button
              type="button"
              variant={urlType === 'external' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUrlType('external')}
            >
              External URL
            </Button>
          </div>

          {urlType === 'file' ? (
            <FormField
              control={form.control}
              name="file_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter file URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="external_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter external URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="file_format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File Format</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PDF, MP4, PPTX" {...field} />
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
              <FormLabel>Access Level *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accessLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_downloadable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Allow Downloads
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable users to download this resource
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

        <FormField
          control={form.control}
          name="sort_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isAdding || isUpdating}>
            {isAdding || isUpdating ? 'Saving...' : initialResource ? 'Update Resource' : 'Add Resource'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

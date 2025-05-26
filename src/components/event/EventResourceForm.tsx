
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

// File format options grouped by resource type
const FILE_FORMATS = {
  video: [
    { value: 'MP4', label: 'MP4' },
    { value: 'AVI', label: 'AVI' },
    { value: 'MOV', label: 'MOV' },
    { value: 'WMV', label: 'WMV' },
    { value: 'MKV', label: 'MKV' },
    { value: 'WEBM', label: 'WEBM' },
    { value: 'FLV', label: 'FLV' },
    { value: 'other', label: 'Other' }
  ],
  audio: [
    { value: 'MP3', label: 'MP3' },
    { value: 'WAV', label: 'WAV' },
    { value: 'AAC', label: 'AAC' },
    { value: 'FLAC', label: 'FLAC' },
    { value: 'OGG', label: 'OGG' },
    { value: 'M4A', label: 'M4A' },
    { value: 'WMA', label: 'WMA' },
    { value: 'other', label: 'Other' }
  ],
  document: [
    { value: 'PDF', label: 'PDF' },
    { value: 'DOCX', label: 'Word Document (DOCX)' },
    { value: 'DOC', label: 'Word Document (DOC)' },
    { value: 'TXT', label: 'Text File' },
    { value: 'RTF', label: 'Rich Text Format' },
    { value: 'ODT', label: 'OpenDocument Text' },
    { value: 'other', label: 'Other' }
  ],
  presentation: [
    { value: 'PPTX', label: 'PowerPoint (PPTX)' },
    { value: 'PPT', label: 'PowerPoint (PPT)' },
    { value: 'KEY', label: 'Keynote' },
    { value: 'ODP', label: 'OpenDocument Presentation' },
    { value: 'PREZI', label: 'Prezi' },
    { value: 'other', label: 'Other' }
  ],
  image: [
    { value: 'JPG', label: 'JPEG' },
    { value: 'PNG', label: 'PNG' },
    { value: 'GIF', label: 'GIF' },
    { value: 'SVG', label: 'SVG' },
    { value: 'BMP', label: 'BMP' },
    { value: 'TIFF', label: 'TIFF' },
    { value: 'WEBP', label: 'WebP' },
    { value: 'other', label: 'Other' }
  ],
  link: [
    { value: 'URL', label: 'Web Link' },
    { value: 'other', label: 'Other' }
  ],
  other: [
    { value: 'ZIP', label: 'ZIP Archive' },
    { value: 'RAR', label: 'RAR Archive' },
    { value: 'TAR', label: 'TAR Archive' },
    { value: 'other', label: 'Other' }
  ]
};

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
  const [showCustomFormat, setShowCustomFormat] = useState(false);

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

  const resourceType = form.watch('resource_type');
  const fileFormat = form.watch('file_format');

  // Get available file formats based on resource type
  const getFileFormats = (type: string) => {
    return FILE_FORMATS[type as keyof typeof FILE_FORMATS] || FILE_FORMATS.other;
  };

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
    <div className="max-h-[600px] overflow-y-auto pr-4">
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
                <div className="space-y-2">
                  <Select 
                    onValueChange={(value) => {
                      if (value === 'other') {
                        setShowCustomFormat(true);
                        field.onChange('');
                      } else {
                        setShowCustomFormat(false);
                        field.onChange(value);
                      }
                    }} 
                    value={showCustomFormat ? 'other' : field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select file format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getFileFormats(resourceType).map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {showCustomFormat && (
                    <FormControl>
                      <Input 
                        placeholder="Enter custom file format" 
                        {...field}
                      />
                    </FormControl>
                  )}
                </div>
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
    </div> 
  );
}


import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEventResourceMutations } from "@/hooks/useEventResourceMutations";
import { EventResource, EventResourceFormData } from "@/types/event-resources";
import { FileUploadSection } from "./FileUploadSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, FileText, Info } from "lucide-react";

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
  const { addResource, updateResource, isAdding, isUpdating } = useEventResourceMutations(eventId);
  const [resourceSource, setResourceSource] = useState<'upload' | 'external'>(
    initialResource?.external_url ? 'external' : 'upload'
  );
  const [showCustomFormat, setShowCustomFormat] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(!!initialResource?.file_url);

  const form = useForm<EventResourceFormData>({
    defaultValues: {
      title: initialResource?.title || '',
      description: initialResource?.description || '',
      resource_type: initialResource?.resource_type || 'document',
      file_url: initialResource?.file_url || '',
      external_url: initialResource?.external_url || '',
      file_format: initialResource?.file_format || '',
      file_size: initialResource?.file_size || undefined,
      is_downloadable: initialResource?.is_downloadable ?? true,
      access_level: initialResource?.access_level || 'public',
      sort_order: initialResource?.sort_order || 0,
    },
  });

  const resourceType = form.watch('resource_type');
  const currentFileUrl = form.watch('file_url');
  const currentExternalUrl = form.watch('external_url');

  // Get available file formats based on resource type
  const getFileFormats = (type: string) => {
    return FILE_FORMATS[type as keyof typeof FILE_FORMATS] || FILE_FORMATS.other;
  };

  // Updated handleFileUploaded to store file size
  const handleFileUploaded = (url: string, metadata: { fileName: string; size: number; type: string }) => {
    console.log('File uploaded, updating form fields:', { url, metadata });
    
    // Update form fields including file size
    form.setValue('file_url', url);
    form.setValue('file_size', metadata.size);
    setFileUploaded(true);
    
    // Auto-detect file format from the file name
    const fileExt = metadata.fileName.split('.').pop()?.toUpperCase();
    if (fileExt && !form.getValues('file_format')) {
      form.setValue('file_format', fileExt);
    }

    // Auto-detect resource type if not set or still default
    const currentResourceType = form.getValues('resource_type');
    if (metadata.type.startsWith('video/') && currentResourceType !== 'video') {
      form.setValue('resource_type', 'video');
    } else if (metadata.type.startsWith('audio/') && currentResourceType !== 'audio') {
      form.setValue('resource_type', 'audio');
    } else if (metadata.type.startsWith('image/') && currentResourceType !== 'image') {
      form.setValue('resource_type', 'image');
    } else if (metadata.type.includes('presentation') && currentResourceType !== 'presentation') {
      form.setValue('resource_type', 'presentation');
    }

    // Auto-fill title if empty
    if (!form.getValues('title')) {
      const fileName = metadata.fileName.replace(/\.[^/.]+$/, ""); // Remove extension
      form.setValue('title', fileName);
    }

    console.log('Form fields updated, file upload complete with size:', metadata.size);
  };

  const onSubmit = (data: EventResourceFormData) => {
    console.log('Form submitted with data:', data);
    
    const resourceData = {
      ...data,
      file_url: resourceSource === 'upload' ? data.file_url : undefined,
      external_url: resourceSource === 'external' ? data.external_url : undefined,
      file_size: resourceSource === 'upload' ? data.file_size : undefined,
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

  const isFormValid = () => {
    const title = form.getValues('title');
    const hasResource = resourceSource === 'upload' ? currentFileUrl : currentExternalUrl;
    return title && hasResource;
  };

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
            <FormLabel>Resource Source *</FormLabel>
            <Tabs value={resourceSource} onValueChange={(value) => setResourceSource(value as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload New File</TabsTrigger>
                <TabsTrigger value="external">Link to External Resource</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <FileUploadSection
                  eventId={eventId}
                  onFileUploaded={handleFileUploaded}
                  maxFiles={1}
                />
                
                {fileUploaded && currentFileUrl && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>File uploaded successfully!</strong> Please complete the remaining form fields and click "Save Resource" to finish.
                      {form.getValues('file_size') && (
                        <div className="mt-1 text-sm">
                          File size: {(form.getValues('file_size')! / 1024 / 1024).toFixed(2)} MB
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {!fileUploaded && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Please upload a file first, then complete the form fields below.
                    </AlertDescription>
                  </Alert>
                )}

                {currentFileUrl && (
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Uploaded file:</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 break-all">{currentFileUrl}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="external">
                <FormField
                  control={form.control}
                  name="external_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External URL *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter external URL (e.g., https://example.com/resource)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
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

          {!isFormValid() && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                {!form.getValues('title') && "Please enter a title for your resource."}
                {form.getValues('title') && !(resourceSource === 'upload' ? currentFileUrl : currentExternalUrl) && 
                  `Please ${resourceSource === 'upload' ? 'upload a file' : 'enter an external URL'}.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isAdding || isUpdating || !isFormValid()}
              className="min-w-[120px]"
            >
              {isAdding || isUpdating ? 'Saving...' : initialResource ? 'Update Resource' : 'Save Resource'}
            </Button>
          </div>
        </form>
      </Form>
    </div> 
  );
}

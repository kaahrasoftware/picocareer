import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useEventResourceUpload } from "@/hooks/useEventResourceUpload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EventResourceFormData } from "@/types/event-resources";
import { Upload, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ResourceBankUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResourceBankUploadDialog({ open, onOpenChange }: ResourceBankUploadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  
  const { uploadFile, uploading } = useEventResourceUpload();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EventResourceFormData & { event_id?: string }>({
    defaultValues: {
      title: "",
      description: "",
      resource_type: "document",
      access_level: "public",
      is_downloadable: true,
      external_url: "",
      event_id: "",
    },
  });

  // Fetch events for association dropdown
  const { data: events } = useQuery({
    queryKey: ['events-for-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_time')
        .eq('status', 'Approved')
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadedFile(file);
      
      // Upload file without event association (we'll use a placeholder eventId)
      const fileUrl = await uploadFile(file, 'resource-bank');
      
      if (fileUrl) {
        setUploadedFileUrl(fileUrl);
        
        // Auto-detect file type and format
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        let resourceType: EventResourceFormData['resource_type'] = 'document';
        
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileExtension || '')) {
          resourceType = 'image';
        } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(fileExtension || '')) {
          resourceType = 'video';
        } else if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'].includes(fileExtension || '')) {
          resourceType = 'audio';
        } else if (['ppt', 'pptx'].includes(fileExtension || '')) {
          resourceType = 'presentation';
        }
        
        form.setValue('resource_type', resourceType);
        form.setValue('file_format', fileExtension);
        form.setValue('file_size', file.size);
        
        // If title is empty, use filename as default
        if (!form.getValues('title')) {
          const fileName = file.name.replace(/\.[^/.]+$/, "");
          form.setValue('title', fileName);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: EventResourceFormData & { event_id?: string }) => {
    setIsSubmitting(true);
    
    try {
      const resourceData = {
        title: data.title,
        description: data.description || null,
        resource_type: data.resource_type,
        access_level: data.access_level,
        is_downloadable: data.is_downloadable,
        file_url: data.resource_type === 'link' ? null : uploadedFileUrl,
        external_url: data.resource_type === 'link' ? data.external_url : null,
        file_format: data.file_format || null,
        file_size: data.file_size || null,
        event_id: data.event_id || null, // Allow null for general resources
        sort_order: 0
      };

      const { error } = await supabase
        .from('event_resources')
        .insert([resourceData]);

      if (error) throw error;

      toast({
        title: "Resource uploaded successfully",
        description: "The resource has been added to the resource bank."
      });

      // Invalidate and refetch the resource bank data
      queryClient.invalidateQueries({ queryKey: ['all-event-resources'] });
      
      // Reset form and close dialog
      form.reset();
      setUploadedFile(null);
      setUploadedFileUrl(null);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating resource:', error);
      toast({
        title: "Error",
        description: "Failed to create resource. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLinkType = form.watch('resource_type') === 'link';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Resource to Resource Bank
          </DialogTitle>
        </DialogHeader>

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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLinkType ? (
              <FormField
                control={form.control}
                name="external_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External URL *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com" 
                        type="url"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">File Upload {!uploadedFileUrl && '*'}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-600">
                        ✓ {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadedFileUrl(null);
                        }}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-primary hover:text-primary/80">
                            Choose a file
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploading}
                          />
                        </label>
                        <span className="text-gray-500"> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Max file size: 100MB
                      </p>
                      {uploading && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="access_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Level *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="registered">Registered Users Only</SelectItem>
                      <SelectItem value="participants_only">Event Participants Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associate with Event (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No Event Association</SelectItem>
                      {events?.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} ({new Date(event.start_time).toLocaleDateString()})
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Allow downloads
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || uploading || (!uploadedFileUrl && !isLinkType)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Resource'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
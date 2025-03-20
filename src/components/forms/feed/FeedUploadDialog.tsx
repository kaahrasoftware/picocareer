
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { getFeedFormFields, RESOURCE_TYPES } from "@/components/forms/feed/FeedFormFields";
import { useAuthSession } from "@/hooks/useAuthSession";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFileSize } from "@/utils/storageUtils";

interface FeedUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedUploadDialog({ open, onOpenChange }: FeedUploadDialogProps) {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resourceType, setResourceType] = useState("text");
  const [formFields, setFormFields] = useState(getFeedFormFields("text"));

  // Update form fields when resource type changes
  useEffect(() => {
    const fields = getFeedFormFields(resourceType);
    
    // Add profile ID to folder path for field that needs it
    if (profile?.id) {
      setFormFields(fields.map(field => {
        if (field.getFolderPath && typeof field.getFolderPath === 'function') {
          return {
            ...field,
            folderPath: field.getFolderPath(profile.id)
          };
        }
        return field;
      }));
    } else {
      setFormFields(fields);
    }
  }, [resourceType, profile?.id]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting resource data:', data);
      
      if (!session?.user?.id || !profile?.id) {
        throw new Error("You must be logged in to upload resources");
      }

      console.log('Session and profile verified:', { 
        userId: session.user.id, 
        profileId: profile.id,
        isVerified: true 
      });

      // Process hashtags into an array
      let hashtagsArray: string[] = [];
      if (data.hashtags) {
        hashtagsArray = data.hashtags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);
      }

      // Extract file size from upload data if available
      const fileSizeInBytes = await getFileSizeFromUrl(data.file_url, resourceType);

      // Add additional metadata
      const resourceData = {
        ...data,
        hashtags: hashtagsArray,
        author_id: session.user.id,
        mentor_id: profile.id,
        resource_type: resourceType,
        status: 'Published',
        created_at: new Date().toISOString(),
        size_in_bytes: fileSizeInBytes,
      };

      console.log('Prepared resource data for upload:', resourceData);

      // Insert into mentor_resources table
      const { data: insertedData, error } = await supabase
        .from('mentor_resources')
        .insert([resourceData]);

      if (error) {
        console.error('Supabase insertion error:', error);
        throw error;
      }

      console.log('Resource successfully uploaded:', insertedData);

      toast({
        title: "Success",
        description: "Resource has been uploaded successfully",
      });

      // Close the dialog
      onOpenChange(false);
      
      // Reset form state
      setResourceType("text");
    } catch (error: any) {
      console.error('Error uploading resource:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload resource. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to estimate file size from URL
  const getFileSizeFromUrl = async (url: string, type: string): Promise<number> => {
    if (!url) return 0;
    
    try {
      // Try to get file size from URL if it's a file hosted on Supabase
      if (url.includes('storage') && url.includes('mentor_resources')) {
        // Extract file path from URL to check its metadata
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const storageIdx = pathParts.indexOf('storage');
        
        if (storageIdx >= 0 && storageIdx + 2 < pathParts.length) {
          const bucket = pathParts[storageIdx + 1];
          const filePath = pathParts.slice(storageIdx + 2).join('/');
          
          try {
            const { data, error } = await supabase
              .storage
              .from(bucket)
              .getPublicUrl(filePath);
              
            if (!error && data) {
              // Try to get headers to check file size
              const response = await fetch(data.publicUrl, { method: 'HEAD' });
              if (response.ok) {
                const contentLength = response.headers.get('content-length');
                if (contentLength) {
                  return parseInt(contentLength, 10);
                }
              }
            }
          } catch (e) {
            console.warn('Could not get file metadata:', e);
          }
        }
      }
      
      // If metadata retrieval fails, use estimated sizes based on resource type
      return getEstimatedFileSize(type);
    } catch (error) {
      console.error('Error determining file size:', error);
      return getEstimatedFileSize(type);
    }
  };
  
  // Helper to provide estimated file sizes by content type
  const getEstimatedFileSize = (type: string): number => {
    switch (type) {
      case 'image': return 500000; // 500KB default for images
      case 'video': return 5000000; // 5MB default for videos
      case 'audio': return 2000000; // 2MB default for audio
      case 'document': return 1000000; // 1MB default for documents
      default: return 100000; // 100KB default for other content
    }
  };

  // Check if user is logged in and is a mentor
  const isMentor = profile?.user_type === 'mentor';

  if (!session) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
          </DialogHeader>
          <div className="py-6">Please sign in to upload resources</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isMentor) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permission Denied</DialogTitle>
          </DialogHeader>
          <div className="py-6">Only mentors can upload resources</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upload Resource</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Label htmlFor="resource-type-selector">Resource Type</Label>
          <Select
            value={resourceType}
            onValueChange={(value) => setResourceType(value)}
          >
            <SelectTrigger id="resource-type-selector" className="w-full">
              <SelectValue placeholder="Select resource type" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-y-auto max-h-[60vh] pr-2 mt-4">
          <GenericUploadForm 
            fields={formFields}
            onSubmit={handleSubmit}
            buttonText="Upload Resource"
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

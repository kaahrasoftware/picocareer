
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseImageUploadProps {
  bucket: string;
  folderPath?: string;
  onUploadSuccess?: (url: string, fileSize?: number) => void;
}

export function useImageUpload({
  bucket,
  folderPath,
  onUploadSuccess
}: UseImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: { onChange: (value: string) => void; value: string }
  ) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
      const fileSize = file.size; // Get file size in bytes

      console.log('Uploading file:', {
        bucket,
        filePath,
        contentType: file.type,
        size: fileSize
      });

      // First try to remove any existing file if there is one
      if (field.value) {
        try {
          const existingFilePath = field.value.split('/').slice(-4).join('/'); // Get last 4 segments (e.g., hubs/[hubId]/logos/[filename])
          await supabase.storage
            .from(bucket)
            .remove([existingFilePath]);
        } catch (removeError) {
          console.warn('Could not remove existing file:', removeError);
          // Continue with upload even if remove fails
        }
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('Upload successful:', {
        publicUrl,
        filePath,
        fileSize: fileSize
      });

      // If this is a hub resource, update the size_in_bytes
      if (bucket === 'hub_resources' && folderPath?.startsWith('hubs/')) {
        const hubId = folderPath.split('/')[1];
        
        // Check if this is for a resource or other file (logo, banner, etc.)
        if (folderPath.includes('/resources/')) {
          // For resources, we'll update when the record is created
          console.log('Hub resource uploaded - size will be updated with resource record');
        } else {
          // For other files (logos, banners), update metrics directly
          try {
            await supabase.rpc('refresh_hub_metrics', { _hub_id: hubId });
            console.log('Hub metrics refreshed after file upload');
          } catch (metricsError) {
            console.warn('Could not refresh hub metrics:', metricsError);
          }
        }
      }

      field.onChange(publicUrl);
      
      // Pass the file size to the callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(publicUrl, fileSize);
      }

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (
    field: { onChange: (value: string) => void; value: string }
  ) => {
    try {
      if (field.value) {
        // Extract path segments for hub resources (hubs/[hubId]/[type]/[filename])
        const pathParts = field.value.split('/');
        const filePath = pathParts.slice(-4).join('/');

        console.log('Removing file:', {
          bucket,
          filePath
        });

        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (error) {
          throw error;
        }
      }

      field.onChange('');
      toast({
        title: "Success",
        description: "File removed successfully",
      });
      
      // Call the callback with empty URL and zero size
      if (onUploadSuccess) {
        onUploadSuccess('', 0);
      }
      
    } catch (error: any) {
      console.error('Remove error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    uploading,
    handleUpload,
    handleRemove
  };
}

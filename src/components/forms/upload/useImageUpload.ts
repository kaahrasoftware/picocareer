
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseImageUploadProps {
  bucket: string;
  folderPath?: string;
  onUploadSuccess?: (url: string) => void;
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
      
      // Use folderPath if provided, otherwise create a default path
      // This ensures we maintain the /mentor_resources/{mentorId}/{fileName} structure
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

      // Ensure file size is properly captured in bytes (browser's File API reports size in bytes)
      const fileSizeInBytes = file.size;

      console.log('Uploading file:', {
        bucket,
        filePath,
        contentType: file.type,
        fileSizeBytes: fileSizeInBytes, 
      });

      // First try to remove any existing file if there is one
      if (field.value) {
        try {
          // Extract path from the full URL
          const existingUrl = new URL(field.value);
          const pathnameParts = existingUrl.pathname.split('/');
          const bucketIndex = pathnameParts.findIndex(part => part === 'storage') + 2;
          const existingFilePath = bucketIndex > 1 ? pathnameParts.slice(bucketIndex).join('/') : null;
          
          if (existingFilePath) {
            await supabase.storage
              .from(bucket)
              .remove([existingFilePath]);
            console.log('Removed existing file:', existingFilePath);
          }
        } catch (removeError) {
          console.warn('Could not remove existing file:', removeError);
          // Continue with upload even if remove fails
        }
      }

      const { error: uploadError, data } = await supabase.storage
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
        fileSizeBytes: fileSizeInBytes,
      });

      field.onChange(publicUrl);
      onUploadSuccess?.(publicUrl);

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
        try {
          // Extract path from the full URL
          const existingUrl = new URL(field.value);
          const pathnameParts = existingUrl.pathname.split('/');
          const bucketIndex = pathnameParts.findIndex(part => part === 'storage') + 2;
          const existingFilePath = bucketIndex > 1 ? pathnameParts.slice(bucketIndex).join('/') : null;
          
          if (existingFilePath) {
            const { error } = await supabase.storage
              .from(bucket)
              .remove([existingFilePath]);
              
            if (error) throw error;
            console.log('Removed file:', existingFilePath);
          }
        } catch (removeError) {
          console.warn('Error parsing file path:', removeError);
          // Continue even if remove fails
        }
      }

      field.onChange('');
      toast({
        title: "Success",
        description: "File removed successfully",
      });
      
      onUploadSuccess?.('');
      
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

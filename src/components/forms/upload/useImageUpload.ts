
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseImageUploadProps {
  bucket: string;
  hubId?: string;
  onUploadSuccess?: (url: string) => void;
}

export function useImageUpload({
  bucket,
  hubId,
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
      
      // If hubId is provided, use the hub's bucket
      const storageBucket = hubId ? `hub-${hubId}` : bucket;

      // Upload file to storage bucket
      const { error: uploadError, data } = await supabase.storage
        .from(storageBucket)
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(storageBucket)
        .getPublicUrl(fileName);

      // Update form field
      field.onChange(publicUrl);
      
      // Call success callback if provided
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
        // Extract the file name from the URL
        const urlParts = field.value.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Determine the correct bucket
        const storageBucket = hubId ? `hub-${hubId}` : bucket;

        const { error } = await supabase.storage
          .from(storageBucket)
          .remove([fileName]);

        if (error) {
          throw error;
        }
      }

      field.onChange('');
      toast({
        title: "Success",
        description: "File removed successfully",
      });
      
      // Call success callback if provided with empty string
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

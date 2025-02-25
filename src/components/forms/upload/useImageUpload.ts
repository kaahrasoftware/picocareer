
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
      // Ensure folder path is properly formatted
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

      console.log('Upload details:', {
        bucket,
        filePath,
        contentType: file.type
      });

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
        filePath
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
        // Extract the file path from the URL
        const urlParts = field.value.split('/');
        // Get everything after the bucket name in the URL
        const filePath = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/');

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

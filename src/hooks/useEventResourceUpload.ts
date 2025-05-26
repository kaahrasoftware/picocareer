
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseEventResourceUploadProps {
  onUploadSuccess?: (url: string, metadata: { fileName: string; size: number; type: string }) => void;
}

export function useEventResourceUpload({ onUploadSuccess }: UseEventResourceUploadProps = {}) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const getAcceptedTypes = () => {
    return {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.wma'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    };
  };

  const validateFile = (file: File): boolean => {
    const maxSize = 100 * 1024 * 1024; // 100MB limit
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 100MB.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File, eventId: string): Promise<string | null> => {
    if (!validateFile(file)) {
      return null;
    }

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}/${crypto.randomUUID()}.${fileExt}`;
      
      console.log('Uploading event resource:', {
        fileName,
        size: file.size,
        type: file.type,
        bucket: 'event-resources'
      });

      const { data, error } = await supabase.storage
        .from('event-resources')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-resources')
        .getPublicUrl(fileName);

      console.log('Upload successful:', { publicUrl, path: data.path });

      const metadata = {
        fileName: file.name,
        size: file.size,
        type: file.type
      };

      onUploadSuccess?.(publicUrl, metadata);

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileUrl: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const eventId = urlParts[urlParts.length - 2];
      const filePath = `${eventId}/${fileName}`;

      const { error } = await supabase.storage
        .from('event-resources')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('File deleted successfully:', filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete file",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    uploading,
    uploadFile,
    deleteFile,
    getAcceptedTypes,
    validateFile
  };
}

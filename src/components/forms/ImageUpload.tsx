import React, { useState, useEffect } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

interface ImageUploadProps {
  control: any;
  name: string;
  label: string;
  description?: string;
  bucket: string;
}

export function ImageUpload({ control, name, label, description, bucket }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const { session } = useAuthSession();

  useEffect(() => {
    // Initialize preview if there's an existing value
    const subscription = control._subjects.watch.subscribe({
      next: (data: any) => {
        if (data[name]) {
          setPreview(data[name]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [control, name]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    try {
      if (!session?.user) {
        throw new Error('You must be logged in to upload images.');
      }

      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${Math.random()}.${fileExt}`;

      // Upload image to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Update form field with the public URL
      onChange(publicUrl);
      setPreview(publicUrl);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
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

  const handleRemove = async (onChange: (value: string) => void) => {
    try {
      if (!session?.user) {
        throw new Error('You must be logged in to remove images.');
      }

      if (preview) {
        // Extract the file path from the public URL
        const urlParts = preview.split('/');
        const filePath = `${session.user.id}/${urlParts[urlParts.length - 1]}`;
        
        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (error) {
          throw error;
        }
      }

      onChange('');
      setPreview(null);
      toast({
        title: "Success",
        description: "Image removed successfully",
      });
    } catch (error: any) {
      console.error('Remove error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-[200px]"
                  disabled={uploading}
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e, field.onChange)}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {preview ? 'Change Image' : 'Upload Image'}
                  </label>
                </Button>
                {preview && (
                  <div className="relative">
                    <div className="relative w-16 h-16 border rounded-md overflow-hidden">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => handleRemove(field.onChange)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Input {...field} type="hidden" />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
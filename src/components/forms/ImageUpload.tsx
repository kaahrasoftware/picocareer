import React, { useState, useEffect } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const fieldValue = control.getFieldState(name)?.value;
    if (fieldValue) {
      setPreview(fieldValue);
    }
  }, [control, name]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be authenticated to upload files.');
      
      // Create a path that includes the user's ID as required by RLS
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

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
      if (preview) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User must be authenticated to remove files.');

        // Extract the file path from the URL
        const urlParts = preview.split('/');
        const fileName = `${user.id}/${urlParts[urlParts.length - 1]}`;

        const { error } = await supabase.storage
          .from(bucket)
          .remove([fileName]);

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
                  variant={preview ? "secondary" : "outline"}
                  className={`relative min-w-[200px] transition-all duration-200 ${
                    uploading ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                  disabled={uploading}
                >
                  <label className="flex items-center gap-2 cursor-pointer w-full justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e, field.onChange)}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="ml-2">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{preview ? 'Change Image' : 'Upload Image'}</span>
                      </>
                    )}
                  </label>
                </Button>
                {preview && (
                  <div className="relative group">
                    <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-secondary/10 transition-all duration-200 group-hover:shadow-md">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
          {description && (
            <FormDescription className="text-sm text-muted-foreground mt-2">
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
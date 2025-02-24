
import React, { useState } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Control } from "react-hook-form";

interface ImageUploadProps {
  control: Control<any>;
  name: string;
  label: string;
  description?: string;
  bucket: string;
  accept?: string;
  onUploadSuccess?: (url: string) => void;
  hubId?: string; // Added hubId prop for hub-specific storage
}

export function ImageUpload({
  control,
  name,
  label,
  description,
  bucket,
  accept = "image/*",
  onUploadSuccess,
  hubId
}: ImageUploadProps) {
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
                  variant={field.value ? "secondary" : "outline"}
                  className={`relative min-w-[200px] transition-all duration-200 ${
                    uploading ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                  disabled={uploading}
                >
                  <label className="flex items-center gap-2 cursor-pointer w-full justify-center">
                    <input
                      type="file"
                      accept={accept}
                      className="hidden"
                      onChange={(e) => handleUpload(e, field)}
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
                        <span>{field.value ? 'Change File' : 'Upload File'}</span>
                      </>
                    )}
                  </label>
                </Button>
                {field.value && (
                  <div className="relative group">
                    <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-secondary/10 transition-all duration-200 group-hover:shadow-md">
                      <img 
                        src={field.value} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => handleRemove(field)}
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

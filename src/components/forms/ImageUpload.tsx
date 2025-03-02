
import React, { useState } from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { UploadButton } from "./upload/UploadButton";
import { ImagePreview } from "./upload/ImagePreview";
import { useImageUpload } from "./upload/useImageUpload";

interface ImageUploadProps {
  control: Control<any>;
  name: string;
  label: string;
  description?: string;
  bucket: string;
  accept?: string;
  onUploadSuccess?: (url: string, fileSize?: number) => void;
  folderPath?: string;
  trackFileSize?: boolean;
}

export function ImageUpload({
  control,
  name,
  label,
  description,
  bucket,
  accept = "image/*",
  onUploadSuccess,
  folderPath,
  trackFileSize = false
}: ImageUploadProps) {
  const [fileSize, setFileSize] = useState<number>(0);
  
  const customUploadSuccess = (url: string) => {
    onUploadSuccess?.(url, fileSize);
  };

  const { uploading, handleUpload, handleRemove } = useImageUpload({
    bucket,
    folderPath,
    onUploadSuccess: customUploadSuccess
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const size = e.target.files[0].size;
      setFileSize(size);
      
      if (trackFileSize) {
        console.log(`File selected with size: ${size} bytes`);
      }
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
                <UploadButton
                  uploading={uploading}
                  hasValue={!!field.value}
                  onInputChange={(e) => {
                    handleFileSelect(e);
                    handleUpload(e, field);
                  }}
                  accept={accept}
                />
                {field.value && (
                  <ImagePreview
                    imageUrl={field.value}
                    onRemove={() => handleRemove(field)}
                  />
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

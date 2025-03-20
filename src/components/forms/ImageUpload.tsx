
import React from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { UploadButton } from "./upload/UploadButton";
import { ImagePreview } from "./upload/ImagePreview";
import { useImageUpload } from "./upload/useImageUpload";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ImageUploadProps {
  control: Control<any>;
  name: string;
  label: string;
  description?: string;
  bucket: string;
  accept?: string;
  onUploadSuccess?: (url: string) => void;
  folderPath?: string;
  getFolderPath?: (profileId: string) => string;
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
  getFolderPath
}: ImageUploadProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  
  // Determine the appropriate folder path
  let finalFolderPath = folderPath;
  
  // If getFolderPath is provided and a profile exists, use the dynamic path
  if (getFolderPath && profile?.id) {
    finalFolderPath = getFolderPath(profile.id);
  }
  
  const { uploading, handleUpload, handleRemove } = useImageUpload({
    bucket,
    folderPath: finalFolderPath,
    onUploadSuccess
  });

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
                  onInputChange={(e) => handleUpload(e, field)}
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

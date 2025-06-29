
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { processImage } from '@/utils/imageProcessing';

interface EventImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function EventImageUpload({ value, onChange }: EventImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Process image to optimize size
      const processedFile = await processImage(file);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('content-images')
        .upload(`events/${fileName}`, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('content-images')
        .getPublicUrl(`events/${fileName}`);

      onChange(publicUrl);
      
      toast({
        title: "Image uploaded successfully",
        description: "Your event image has been uploaded.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  if (value) {
    return (
      <Card className="relative p-4">
        <img 
          src={value} 
          alt="Event preview" 
          className="w-full h-48 object-cover rounded-lg"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2 p-8">
      <div className="text-center space-y-4">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Upload Event Image</p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
        <div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Choose Image'}
          </Button>
        </div>
      </div>
    </Card>
  );
}


import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/hub/management/sections/branding/ColorPicker";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { EmailContentTypeSettings } from "@/types/database/email";

interface ContentTypeTemplateEditorProps {
  adminId: string;
  contentType: string;
}

interface FormData extends Omit<EmailContentTypeSettings, 'id' | 'admin_id' | 'created_at' | 'updated_at'> {
  layout_settings: {
    headerStyle: 'centered' | 'banner' | 'minimal';
    showAuthor: boolean;
    showDate: boolean;
    imagePosition: 'top' | 'inline' | 'side';
    contentBlocks: string[];
    metadataDisplay: string[];
  };
}

export function ContentTypeTemplateEditor({ adminId, contentType }: ContentTypeTemplateEditorProps) {
  const { register, setValue, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      content_type: contentType,
      primary_color: '#9b87f5',
      secondary_color: '#7E69AB',
      accent_color: '#8B5CF6',
      layout_settings: {
        headerStyle: 'centered',
        showAuthor: true,
        showDate: true,
        imagePosition: 'top',
        contentBlocks: [],
        metadataDisplay: []
      }
    }
  });

  const primaryColor = watch('primary_color');
  const secondaryColor = watch('secondary_color');
  const accentColor = watch('accent_color');

  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('email_content_type_settings')
        .select('*')
        .eq('admin_id', adminId)
        .eq('content_type', contentType)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error('Error loading template settings:', error);
        }
        return;
      }

      if (data) {
        setValue('primary_color', data.primary_color);
        setValue('secondary_color', data.secondary_color);
        setValue('accent_color', data.accent_color);
        setValue('layout_settings', data.layout_settings);
      }
    };

    loadSettings();
  }, [adminId, contentType, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from('email_content_type_settings')
        .upsert({
          admin_id: adminId,
          content_type: contentType,
          ...data
        });

      if (error) throw error;

      toast.success('Template settings updated successfully');
    } catch (error: any) {
      toast.error('Failed to save template settings');
      console.error('Error saving template settings:', error);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{contentType} Template Settings</h3>
          
          <div className="space-y-4">
            <ColorPicker
              value={primaryColor}
              onChange={(value) => setValue('primary_color', value)}
              label="Primary Color"
              description="Main brand color for this content type"
            />
            
            <ColorPicker
              value={secondaryColor}
              onChange={(value) => setValue('secondary_color', value)}
              label="Secondary Color"
              description="Used for gradients and backgrounds"
            />
            
            <ColorPicker
              value={accentColor}
              onChange={(value) => setValue('accent_color', value)}
              label="Accent Color"
              description="Used for links and call-to-actions"
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Layout Settings</h4>
            
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Header Style</label>
                <select 
                  {...register('layout_settings.headerStyle')}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="centered">Centered</option>
                  <option value="banner">Banner</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Image Position</label>
                <select 
                  {...register('layout_settings.imagePosition')}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="top">Top</option>
                  <option value="inline">Inline</option>
                  <option value="side">Side</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    {...register('layout_settings.showAuthor')}
                    className="rounded" 
                  />
                  Show Author
                </label>

                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    {...register('layout_settings.showDate')}
                    className="rounded" 
                  />
                  Show Date
                </label>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit">
          Save Template Settings
        </Button>
      </form>
    </Card>
  );
}

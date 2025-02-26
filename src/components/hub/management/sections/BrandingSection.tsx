
import { Control, useFormContext } from "react-hook-form";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FormData } from "../HubGeneralSettings";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw } from "lucide-react";
import { DEFAULT_COLORS } from "./branding/constants";
import { ColorPicker } from "./branding/ColorPicker";
import { ColorPreview } from "./branding/ColorPreview";

interface BrandingSectionProps {
  control: Control<FormData>;
  register: any;
  hubId: string;
  defaultValues: FormData;
}

export function BrandingSection({ control, register, hubId, defaultValues }: BrandingSectionProps) {
  const queryClient = useQueryClient();
  const { getValues, setValue } = useFormContext<FormData>();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      console.log('Saving branding settings...');
      const { logo_url, banner_url, brand_colors, name, type } = getValues();
      
      // Update only branding related fields while preserving required fields
      const { error: updateError } = await supabase
        .from('hubs')
        .update({
          logo_url,
          banner_url,
          brand_colors,
          name: name || defaultValues.name, // Preserve the existing name
          type: type || defaultValues.type, // Preserve the existing type
          updated_at: new Date().toISOString()
        })
        .eq('id', hubId);

      if (updateError) {
        console.error('Error updating hub branding:', updateError);
        throw updateError;
      }

      await queryClient.invalidateQueries({ queryKey: ['hub', hubId] });
      await queryClient.invalidateQueries({ queryKey: ['hubs'] });
      
      toast({
        title: "Success",
        description: "Branding settings have been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving branding settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save branding settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUploadSuccess = async (newUrl: string) => {
    await queryClient.invalidateQueries({ queryKey: ['hub', hubId] });
    await queryClient.invalidateQueries({ queryKey: ['hubs'] });
  };

  const resetColors = () => {
    setValue('brand_colors.primary', DEFAULT_COLORS.primary);
    setValue('brand_colors.secondary', DEFAULT_COLORS.secondary);
    setValue('brand_colors.accent', DEFAULT_COLORS.accent);
  };

  const primaryColor = getValues("brand_colors.primary") || DEFAULT_COLORS.primary;
  const secondaryColor = getValues("brand_colors.secondary") || DEFAULT_COLORS.secondary;
  const accentColor = getValues("brand_colors.accent") || DEFAULT_COLORS.accent;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Branding</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetColors}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Colors
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ImageUpload
            control={control}
            name="logo_url"
            label="Logo"
            description="Upload your hub logo (recommended size: 200x200px)"
            bucket="hub_resources"
            folderPath={`hubs/${hubId}/logos`}
            onUploadSuccess={handleImageUploadSuccess}
          />
          <ImageUpload
            control={control}
            name="banner_url"
            label="Banner"
            description="Upload your hub banner (recommended size: 1200x300px)"
            bucket="hub_resources"
            folderPath={`hubs/${hubId}/banners`}
            onUploadSuccess={handleImageUploadSuccess}
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Brand Colors</h4>
            <div className="text-sm text-muted-foreground">
              Preview your color scheme in real-time
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <ColorPicker
              value={primaryColor}
              onChange={(value) => setValue("brand_colors.primary", value)}
              label="Primary Color"
              description="Main brand color, used for primary elements and emphasis"
            />
            
            <ColorPicker
              value={secondaryColor}
              onChange={(value) => setValue("brand_colors.secondary", value)}
              label="Secondary Color"
              description="Supporting color, used for secondary elements and backgrounds"
            />
            
            <ColorPicker
              value={accentColor}
              onChange={(value) => setValue("brand_colors.accent", value)}
              label="Accent Color"
              description="Highlight color, used for calls-to-action and important elements"
            />
          </div>

          <ColorPreview 
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
          />
        </div>
      </CardContent>
    </Card>
  );
}

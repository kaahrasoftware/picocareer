import { Control, useFormContext } from "react-hook-form";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FormData } from "../HubGeneralSettings";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface BrandingSectionProps {
  control: Control<FormData>;
  register: any;
  hubId: string;
  defaultValues: {
    logo_url: string;
    banner_url: string;
    brand_colors: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  };
}

export function BrandingSection({ control, register, hubId, defaultValues }: BrandingSectionProps) {
  const queryClient = useQueryClient();
  const { getValues } = useFormContext<FormData>();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { logo_url, banner_url, brand_colors } = getValues();
      
      const { error } = await supabase
        .from('hubs')
        .update({
          logo_url,
          banner_url,
          brand_colors,
          updated_at: new Date().toISOString()
        })
        .eq('id', hubId);

      if (error) throw error;

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hubId,
        _action: 'hub_settings_updated',
        _details: {
          logo_url,
          banner_url,
          brand_colors
        }
      });

      // Invalidate both the specific hub query and the hubs list
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
        description: "Failed to save branding settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUploadSuccess = async (newUrl: string) => {
    await queryClient.invalidateQueries({ queryKey: ['hub', hubId] });
    await queryClient.invalidateQueries({ queryKey: ['hubs'] });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Branding</CardTitle>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ImageUpload
            control={control}
            name="logo_url"
            label="Logo"
            description="Upload your hub logo (recommended size: 200x200px)"
            bucket="hub-logos"
            onUploadSuccess={handleImageUploadSuccess}
          />
          <ImageUpload
            control={control}
            name="banner_url"
            label="Banner"
            description="Upload your hub banner (recommended size: 1200x300px)"
            bucket="hub-banners"
            onUploadSuccess={handleImageUploadSuccess}
          />
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Brand Colors</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="primaryColor" className="text-sm font-medium">Primary Color</label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  className="w-12 h-10 p-1"
                  {...register("brand_colors.primary")}
                />
                <Input
                  type="text"
                  {...register("brand_colors.primary")}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="secondaryColor" className="text-sm font-medium">Secondary Color</label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  className="w-12 h-10 p-1"
                  {...register("brand_colors.secondary")}
                />
                <Input
                  type="text"
                  {...register("brand_colors.secondary")}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="accentColor" className="text-sm font-medium">Accent Color</label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  className="w-12 h-10 p-1"
                  {...register("brand_colors.accent")}
                />
                <Input
                  type="text"
                  {...register("brand_colors.accent")}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

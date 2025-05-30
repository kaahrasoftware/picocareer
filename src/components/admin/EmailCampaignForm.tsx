
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { ColorPicker } from "@/components/hub/management/sections/branding/ColorPicker";
import { useForm, FormProvider } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ColorPreview } from "@/components/hub/management/sections/branding/ColorPreview";

interface EmailTemplateSettingsFormData {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

export interface EmailCampaignFormProps {
  adminId: string;
  onCampaignCreated?: () => void;
}

export function EmailCampaignForm({ adminId, onCampaignCreated }: EmailCampaignFormProps) {
  return <div>Email Campaign Form Content</div>;
}

export function EmailTemplateSettingsTab({ adminId }: { adminId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const methods = useForm<EmailTemplateSettingsFormData>({
    defaultValues: {
      logo_url: "",
      primary_color: "#9b87f5",
      secondary_color: "#7E69AB", 
      accent_color: "#8B5CF6"
    }
  });

  const { watch, setValue } = methods;
  const primaryColor = watch("primary_color");
  const secondaryColor = watch("secondary_color");
  const accentColor = watch("accent_color");

  // Load existing settings if available
  useEffect(() => {
    const loadTemplateSettings = async () => {
      if (!adminId) return;
      
      try {
        const { data, error } = await supabase
          .from('email_template_settings')
          .select('*')
          .eq('admin_id', adminId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setValue("logo_url", data.logo_url || "");
          setValue("primary_color", data.primary_color);
          setValue("secondary_color", data.secondary_color);
          setValue("accent_color", data.accent_color);
        }
      } catch (error) {
        console.error("Error loading template settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplateSettings();
  }, [adminId, setValue]);

  const onSubmit = async (data: EmailTemplateSettingsFormData) => {
    setSubmitting(true);
    try {
      // Upsert template settings
      const { error } = await supabase
        .from('email_template_settings')
        .upsert({
          admin_id: adminId,
          logo_url: data.logo_url,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color
        }, { 
          onConflict: 'admin_id' 
        });

      if (error) throw error;

      toast.success("Email Template Settings Updated");
    } catch (error) {
      console.error("Error saving template settings:", error);
      toast.error("Failed to save template settings");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Loading template settings...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Email Template Design</h3>
            <div className="space-y-6">
              <ImageUpload
                control={methods.control}
                name="logo_url"
                label="Company Logo"
                description="Upload your company logo (recommended size: 150x40px)"
                bucket="email-assets"
                folderPath="logos"
              />

              <div className="grid gap-6 pt-2">
                <ColorPicker
                  value={primaryColor}
                  onChange={(value) => methods.setValue("primary_color", value)}
                  label="Primary Color"
                  description="Main brand color used in headers and buttons"
                />
                
                <ColorPicker
                  value={secondaryColor}
                  onChange={(value) => methods.setValue("secondary_color", value)}
                  label="Secondary Color"
                  description="Used for gradients and backgrounds"
                />
                
                <ColorPicker
                  value={accentColor}
                  onChange={(value) => methods.setValue("accent_color", value)}
                  label="Accent Color"
                  description="Used for links and call-to-action buttons"
                />
              </div>

              <ColorPreview
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                accentColor={accentColor}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Template Settings"}
          </Button>
        </form>
      </FormProvider>
    </Card>
  );
}

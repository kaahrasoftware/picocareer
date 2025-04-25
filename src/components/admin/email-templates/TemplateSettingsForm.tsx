import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ColorPicker } from "@/components/hub/management/sections/branding/ColorPicker";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ColorPreview } from "@/components/hub/management/sections/branding/ColorPreview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TemplateSettingsFormData {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

interface TemplateSettingsFormProps {
  adminId: string;
}

export function TemplateSettingsForm({ adminId }: TemplateSettingsFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const methods = useForm<TemplateSettingsFormData>({
    defaultValues: {
      logo_url: "",
      primary_color: "#9b87f5",
      secondary_color: "#7E69AB",
      accent_color: "#8B5CF6"
    }
  });

  const { watch } = methods;
  const primaryColor = watch("primary_color");
  const secondaryColor = watch("secondary_color");
  const accentColor = watch("accent_color");

  const onSubmit = async (data: TemplateSettingsFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('email_template_settings')
        .upsert({
          admin_id: adminId,
          ...data
        });

      if (error) throw error;
      toast.success("Default template settings saved");
    } catch (error) {
      console.error("Error saving template settings:", error);
      toast.error("Failed to save template settings");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Email Template Settings</h3>
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
    </div>
  );
}

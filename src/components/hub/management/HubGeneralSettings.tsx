
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Hub } from "@/types/database/hubs";
import { BrandingSection } from "./sections/BrandingSection";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { ContactInfoSection } from "./sections/ContactInfoSection";
import { SocialLinksSection } from "./sections/SocialLinksSection";

interface HubGeneralSettingsProps {
  hub: Hub;
}

export interface FormData {
  name: string;
  description: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  brand_colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export function HubGeneralSettings({ hub }: HubGeneralSettingsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: hub.name,
      description: hub.description || "",
      website: hub.website || "",
      logo_url: hub.logo_url || "",
      banner_url: hub.banner_url || "",
      brand_colors: hub.brand_colors || {
        primary: "#9b87f5",
        secondary: "#7E69AB",
        accent: "#8B5CF6"
      },
      contact_info: hub.contact_info || {},
      social_links: hub.social_links || {},
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('hubs')
        .update({
          name: data.name,
          description: data.description,
          website: data.website,
          logo_url: data.logo_url,
          banner_url: data.banner_url,
          brand_colors: data.brand_colors,
          contact_info: data.contact_info,
          social_links: data.social_links,
          updated_at: new Date().toISOString()
        })
        .eq('id', hub.id);

      if (error) throw error;

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hub.id,
        _action: 'hub_settings_updated',
        _details: { changes: data }
      });

      toast({
        title: "Settings updated",
        description: "Hub settings have been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating hub settings:', error);
      toast({
        title: "Error",
        description: "Failed to update hub settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <BrandingSection control={control} register={register} />
      <BasicInfoSection register={register} errors={errors} />
      <ContactInfoSection register={register} />
      <SocialLinksSection register={register} />

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

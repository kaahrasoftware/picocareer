
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Hub, ImportantLink } from "@/types/database/hubs";
import { BrandingSection } from "./sections/BrandingSection";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { ContactInfoSection } from "./sections/ContactInfoSection";
import { SocialLinksSection } from "./sections/SocialLinksSection";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface HubGeneralSettingsProps {
  hub: Hub;
}

const formSchema = z.object({
  name: z.string().min(1, "Hub name is required"),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  apply_now_URL: z.string().url().optional().or(z.literal("")),
  logo_url: z.string().optional(),
  banner_url: z.string().optional(),
  important_links: z.array(z.object({
    title: z.string(),
    url: z.string().url().optional().or(z.literal(""))
  })).optional(),
  brand_colors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
  contact_info: z.object({
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  social_links: z.object({
    facebook: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
  }).optional(),
});

export type FormData = z.infer<typeof formSchema>;

export function HubGeneralSettings({ hub }: HubGeneralSettingsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: hub.name,
      description: hub.description || "",
      website: hub.website || "",
      apply_now_URL: hub.apply_now_URL || "",
      logo_url: hub.logo_url || "",
      banner_url: hub.banner_url || "",
      important_links: (hub.important_links || []) as ImportantLink[],
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
      console.log('Submitting hub update with data:', data);

      // First, validate the data
      formSchema.parse(data);

      // Filter out empty important links
      const filteredImportantLinks = (data.important_links || []).filter(
        link => link.title && link.url
      );
      
      const updateData = {
        name: data.name,
        description: data.description,
        website: data.website,
        apply_now_URL: data.apply_now_URL,
        logo_url: data.logo_url,
        banner_url: data.banner_url,
        important_links: filteredImportantLinks,
        brand_colors: data.brand_colors,
        contact_info: data.contact_info,
        social_links: data.social_links,
        updated_at: new Date().toISOString()
      };

      console.log('Sending update to Supabase:', updateData);

      const { data: updatedHub, error } = await supabase
        .from('hubs')
        .update(updateData)
        .eq('id', hub.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating hub:', error);
        throw error;
      }

      console.log('Hub updated successfully:', updatedHub);

      // Log the audit event
      const { error: auditError } = await supabase.rpc('log_hub_audit_event', {
        _hub_id: hub.id,
        _action: 'hub_settings_updated',
        _details: JSON.stringify({ changes: data })
      });

      if (auditError) {
        console.error('Error logging audit event:', auditError);
      }

      toast({
        title: "Settings updated",
        description: "Hub settings have been successfully updated.",
      });
    } catch (error) {
      console.error('Error in onSubmit:', error);
      toast({
        title: "Error",
        description: error instanceof z.ZodError 
          ? "Please check the form for errors."
          : "Failed to update hub settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <BrandingSection control={methods.control} register={methods.register} />
        <BasicInfoSection register={methods.register} errors={methods.formState.errors} />
        <ContactInfoSection register={methods.register} />
        <SocialLinksSection register={methods.register} />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

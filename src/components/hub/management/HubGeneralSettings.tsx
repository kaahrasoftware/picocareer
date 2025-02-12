
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Hub, ImportantLink } from "@/types/database/hubs";
import { BrandingSection } from "./sections/BrandingSection";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { ContactInfoSection } from "./sections/ContactInfoSection";
import { SocialLinksSection } from "./sections/SocialLinksSection";
import { ImportantLinksSection } from "./sections/ImportantLinksSection";
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

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: hub.name,
      description: hub.description || "",
      website: hub.website || "",
      apply_now_URL: hub.apply_now_URL || "",
      logo_url: hub.logo_url || "",
      banner_url: hub.banner_url || "",
      important_links: Array.isArray(hub.important_links) ? hub.important_links : [],
      brand_colors: hub.brand_colors || {
        primary: "#9b87f5",
        secondary: "#7E69AB",
        accent: "#8B5CF6"
      },
      contact_info: hub.contact_info || {},
      social_links: hub.social_links || {},
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <BrandingSection 
          control={methods.control} 
          register={methods.register} 
          hubId={hub.id}
          defaultValues={{
            logo_url: hub.logo_url || "",
            banner_url: hub.banner_url || "",
            brand_colors: hub.brand_colors || {
              primary: "#9b87f5",
              secondary: "#7E69AB",
              accent: "#8B5CF6"
            }
          }}
        />
        <BasicInfoSection 
          register={methods.register} 
          errors={methods.formState.errors} 
          hubId={hub.id}
          defaultValues={{
            name: hub.name,
            description: hub.description || "",
            website: hub.website || "",
            apply_now_URL: hub.apply_now_URL || ""
          }}
        />
        <ImportantLinksSection 
          register={methods.register}
          hubId={hub.id}
          defaultValues={Array.isArray(hub.important_links) ? hub.important_links : []}
        />
        <ContactInfoSection 
          register={methods.register} 
          hubId={hub.id}
          defaultValues={hub.contact_info || {}}
        />
        <SocialLinksSection 
          register={methods.register} 
          hubId={hub.id}
          defaultValues={hub.social_links || {}}
        />
      </div>
    </FormProvider>
  );
}

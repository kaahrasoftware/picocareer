import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/forms/ImageUpload";
import type { Hub } from "@/types/database/hubs";

interface HubGeneralSettingsProps {
  hub: Hub;
}

interface FormData {
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
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ImageUpload
              control={control}
              name="logo_url"
              label="Logo"
              description="Upload your hub logo (recommended size: 200x200px)"
              bucket="hub-logos"
            />
            <ImageUpload
              control={control}
              name="banner_url"
              label="Banner"
              description="Upload your hub banner (recommended size: 1200x300px)"
              bucket="hub-banners"
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

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Hub Name</label>
            <Input
              id="name"
              {...register("name", { required: "Hub name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              {...register("description")}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-medium">Website</label>
            <Input
              id="website"
              type="url"
              {...register("website")}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              {...register("contact_info.email")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
            <Input
              id="phone"
              {...register("contact_info.phone")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">Address</label>
            <Textarea
              id="address"
              {...register("contact_info.address")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="facebook" className="text-sm font-medium">Facebook</label>
            <Input
              id="facebook"
              {...register("social_links.facebook")}
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="twitter" className="text-sm font-medium">Twitter</label>
            <Input
              id="twitter"
              {...register("social_links.twitter")}
              placeholder="https://twitter.com/..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</label>
            <Input
              id="linkedin"
              {...register("social_links.linkedin")}
              placeholder="https://linkedin.com/..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="instagram" className="text-sm font-medium">Instagram</label>
            <Input
              id="instagram"
              {...register("social_links.instagram")}
              placeholder="https://instagram.com/..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

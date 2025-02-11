
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Hub } from "@/types/database/hubs";

interface HubGeneralSettingsProps {
  hub: Hub;
}

interface FormData {
  name: string;
  description: string;
  website?: string;
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

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: hub.name,
      description: hub.description || "",
      website: hub.website || "",
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

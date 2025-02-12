
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FormData } from "../HubGeneralSettings";
import { UseFormRegister } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface SocialLinksSectionProps {
  register: UseFormRegister<FormData>;
  hubId: string;
  defaultValues: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export function SocialLinksSection({ register, hubId, defaultValues }: SocialLinksSectionProps) {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFieldSave = async (fieldName: string) => {
    setIsLoading(prev => ({ ...prev, [fieldName]: true }));

    try {
      const fieldValue = (document.getElementById(fieldName) as HTMLInputElement)?.value;
      
      const { error } = await supabase
        .from('hubs')
        .update({ 
          social_links: {
            ...defaultValues,
            [fieldName]: fieldValue
          }
        })
        .eq('id', hubId);

      if (error) throw error;

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hubId,
        _action: 'hub_settings_updated',
        _details: JSON.stringify({ [`social_links.${fieldName}`]: fieldValue })
      });

      await queryClient.invalidateQueries({ queryKey: ['hub', hubId] });

      toast({
        title: "Field updated",
        description: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to update field. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="facebook" className="text-sm font-medium">Facebook</label>
          <div className="flex gap-2">
            <Input
              id="facebook"
              {...register("social_links.facebook")}
              placeholder="https://facebook.com/..."
              defaultValue={defaultValues.facebook}
            />
            <Button 
              onClick={() => handleFieldSave("facebook")}
              disabled={isLoading.facebook}
            >
              {isLoading.facebook ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="twitter" className="text-sm font-medium">Twitter</label>
          <div className="flex gap-2">
            <Input
              id="twitter"
              {...register("social_links.twitter")}
              placeholder="https://twitter.com/..."
              defaultValue={defaultValues.twitter}
            />
            <Button 
              onClick={() => handleFieldSave("twitter")}
              disabled={isLoading.twitter}
            >
              {isLoading.twitter ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</label>
          <div className="flex gap-2">
            <Input
              id="linkedin"
              {...register("social_links.linkedin")}
              placeholder="https://linkedin.com/..."
              defaultValue={defaultValues.linkedin}
            />
            <Button 
              onClick={() => handleFieldSave("linkedin")}
              disabled={isLoading.linkedin}
            >
              {isLoading.linkedin ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="instagram" className="text-sm font-medium">Instagram</label>
          <div className="flex gap-2">
            <Input
              id="instagram"
              {...register("social_links.instagram")}
              placeholder="https://instagram.com/..."
              defaultValue={defaultValues.instagram}
            />
            <Button 
              onClick={() => handleFieldSave("instagram")}
              disabled={isLoading.instagram}
            >
              {isLoading.instagram ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

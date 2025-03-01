
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { FormData } from "../HubGeneralSettings";
import { UseFormRegister } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface BasicInfoSectionProps {
  register: UseFormRegister<FormData>;
  errors: any;
  hubId: string;
  defaultValues: {
    name: string;
    description: string;
    website: string;
    apply_now_URL: string;
  };
}

export function BasicInfoSection({ register, errors, hubId, defaultValues }: BasicInfoSectionProps) {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const handleFieldSave = async (fieldName: string) => {
    setIsLoading(prev => ({ ...prev, [fieldName]: true }));

    try {
      const fieldValue = (document.getElementById(fieldName) as HTMLInputElement | HTMLTextAreaElement)?.value;
      
      if (!fieldValue && fieldName === 'name') {
        toast({
          title: "Error",
          description: "Hub name is required",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('hubs')
        .update({ [fieldName]: fieldValue })
        .eq('id', hubId);

      if (error) throw error;

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hubId,
        _action: 'hub_settings_updated',
        _details: { [fieldName]: fieldValue }
      });

      await queryClient.invalidateQueries({ queryKey: ['hub', hubId] });

      toast({
        title: "Field updated",
        description: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace('_', ' ')} has been updated successfully.`,
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
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Hub Name</label>
          <div className="flex gap-2">
            <Input
              id="name"
              {...register("name", { required: "Hub name is required" })}
              defaultValue={defaultValues.name}
            />
            <Button 
              onClick={() => handleFieldSave("name")}
              disabled={isLoading.name}
            >
              {isLoading.name ? "Saving..." : "Save"}
            </Button>
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <div className="flex gap-2">
            <Textarea
              id="description"
              {...register("description")}
              defaultValue={defaultValues.description}
              rows={4}
            />
            <Button 
              onClick={() => handleFieldSave("description")}
              disabled={isLoading.description}
            >
              {isLoading.description ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="text-sm font-medium">Website</label>
          <div className="flex gap-2">
            <Input
              id="website"
              type="url"
              {...register("website")}
              defaultValue={defaultValues.website}
              placeholder="https://..."
            />
            <Button 
              onClick={() => handleFieldSave("website")}
              disabled={isLoading.website}
            >
              {isLoading.website ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="apply_now_URL" className="text-sm font-medium">Apply Now URL</label>
          <div className="flex gap-2">
            <Input
              id="apply_now_URL"
              type="url"
              {...register("apply_now_URL")}
              defaultValue={defaultValues.apply_now_URL}
              placeholder="https://..."
            />
            <Button 
              onClick={() => handleFieldSave("apply_now_URL")}
              disabled={isLoading.apply_now_URL}
            >
              {isLoading.apply_now_URL ? "Saving..." : "Save"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Add a direct link to your application form or process
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

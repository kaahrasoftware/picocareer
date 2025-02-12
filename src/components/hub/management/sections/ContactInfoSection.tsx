
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

interface ContactInfoSectionProps {
  register: UseFormRegister<FormData>;
  hubId: string;
  defaultValues: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export function ContactInfoSection({ register, hubId, defaultValues }: ContactInfoSectionProps) {
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFieldSave = async (fieldName: string) => {
    setIsLoading(prev => ({ ...prev, [fieldName]: true }));

    try {
      const fieldValue = (document.getElementById(fieldName) as HTMLInputElement | HTMLTextAreaElement)?.value;
      
      const { error } = await supabase
        .from('hubs')
        .update({ 
          contact_info: {
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
        _details: JSON.stringify({ [`contact_info.${fieldName}`]: fieldValue })
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
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              {...register("contact_info.email")}
              defaultValue={defaultValues.email}
            />
            <Button 
              onClick={() => handleFieldSave("email")}
              disabled={isLoading.email}
            >
              {isLoading.email ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">Phone</label>
          <div className="flex gap-2">
            <Input
              id="phone"
              {...register("contact_info.phone")}
              defaultValue={defaultValues.phone}
            />
            <Button 
              onClick={() => handleFieldSave("phone")}
              disabled={isLoading.phone}
            >
              {isLoading.phone ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">Address</label>
          <div className="flex gap-2">
            <Textarea
              id="address"
              {...register("contact_info.address")}
              defaultValue={defaultValues.address}
            />
            <Button 
              onClick={() => handleFieldSave("address")}
              disabled={isLoading.address}
            >
              {isLoading.address ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

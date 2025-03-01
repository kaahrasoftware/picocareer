
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "../HubGeneralSettings";
import { supabase } from "@/integrations/supabase/client";

interface BasicInfoSectionProps {
  register: UseFormRegister<FormData>;
  errors: any;
  hubId: string;
  defaultValues: {
    name: string;
    description: string;
    website: string;
    apply_now_url: string;
  };
}

export function BasicInfoSection({
  register,
  errors,
  hubId,
  defaultValues
}: BasicInfoSectionProps) {
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formElement = e.target as HTMLFormElement;
      const formData = new FormData(formElement);
      
      const updateData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string, 
        website: formData.get('website') as string,
        apply_now_url: formData.get('apply_now_url') as string,
      };
      
      const { error } = await supabase
        .from('hubs')
        .update(updateData)
        .eq('id', hubId);
        
      if (error) throw error;
      
      toast({
        title: "Basic info updated",
        description: "Hub information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating basic info:', error);
      toast({
        title: "Update failed",
        description: "Failed to update hub information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hub Name</Label>
            <Input
              id="name"
              defaultValue={defaultValues.name}
              {...register("name", { required: true })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">Hub name is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              defaultValue={defaultValues.description}
              rows={4}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://example.com"
              defaultValue={defaultValues.website}
              {...register("website")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apply_now_url">Apply Now URL</Label>
            <Input
              id="apply_now_url"
              placeholder="https://example.com/apply"
              defaultValue={defaultValues.apply_now_url}
              {...register("apply_now_url")}
            />
          </div>

          <Button type="submit">Save Basic Info</Button>
        </form>
      </CardContent>
    </Card>
  );
}

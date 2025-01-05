import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SESSION_TYPE_OPTIONS, SessionTypeEnum } from "@/types/session";
import { SessionTypeFormData, SessionTypeFormProps } from "./types";
import { SessionTypeSelect } from "./SessionTypeSelect";
import { PlatformSelect } from "./PlatformSelect";
import { PlatformFields } from "./PlatformFields";
import { useQueryClient } from "@tanstack/react-query";

export function SessionTypeForm({ profileId, onSuccess, onCancel, existingTypes }: SessionTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<SessionTypeFormData>();

  const selectedPlatforms = form.watch("meeting_platform") || [];
  const showTelegramField = selectedPlatforms.includes("Telegram");
  const showPhoneField = selectedPlatforms.includes("Phone Call");
  const showWhatsAppField = selectedPlatforms.includes("WhatsApp");

  const availableTypes = SESSION_TYPE_OPTIONS.filter(
    type => !existingTypes.some(existing => existing.type === type)
  );

  const onSubmit = async (data: SessionTypeFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Attempting to add session type:', data);

      const { data: existingType } = await supabase
        .from('mentor_session_types')
        .select('id, type')
        .eq('profile_id', profileId)
        .eq('type', data.type)
        .single();

      console.log('Existing type check result:', existingType);

      if (existingType) {
        console.log('Found existing session type:', existingType);
        toast({
          title: "Error",
          description: `You already have a "${data.type}" session type created.`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('mentor_session_types')
        .insert({
          profile_id: profileId,
          type: data.type,
          duration: parseInt(data.duration.toString()),
          price: 0,
          description: data.description || null,
          meeting_platform: data.meeting_platform,
          telegram_username: data.telegram_username?.startsWith('@') 
            ? data.telegram_username 
            : data.telegram_username ? `@${data.telegram_username}` : null,
          phone_number: data.phone_number || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session type:', error);
        throw error;
      }

      // Immediately invalidate and refetch the query
      queryClient.invalidateQueries({ queryKey: ['mentor-session-types', profileId] });

      toast({
        title: "Success",
        description: "Session type created successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating session type:', error);
      toast({
        title: "Error",
        description: "Failed to create session type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <SessionTypeSelect form={form} availableTypes={availableTypes} />

        <FormField
          control={form.control}
          name="duration"
          rules={{
            required: "Duration is required",
            min: { value: 15, message: "Minimum duration is 15 minutes" },
            max: { value: 180, message: "Maximum duration is 180 minutes" }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PlatformSelect form={form} />
        
        <PlatformFields 
          form={form}
          showTelegramField={showTelegramField}
          showPhoneField={showPhoneField}
          showWhatsAppField={showWhatsAppField}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Session Type"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

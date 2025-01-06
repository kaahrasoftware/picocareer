import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SessionTypeFormProps, SessionTypeFormData } from "./types";
import { SessionTypeSelect } from "./SessionTypeSelect";
import { PlatformSelect } from "./PlatformSelect";
import { PlatformFields } from "./PlatformFields";
import { useQueryClient } from "@tanstack/react-query";
import { SessionTypeEnum } from "@/types/session";

export function SessionTypeForm({ profileId, onSuccess, onCancel, existingTypes }: SessionTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const methods = useForm<SessionTypeFormData>({
    defaultValues: {
      type: undefined as unknown as SessionTypeEnum,
      duration: 0,
      price: 0,
      description: "",
      meeting_platform: [],
      telegram_username: "",
      phone_number: ""
    }
  });

  const selectedPlatforms = methods.watch("meeting_platform") || [];
  const showTelegramField = selectedPlatforms.includes("Telegram");
  const showPhoneField = selectedPlatforms.includes("Phone Call");
  const showWhatsAppField = selectedPlatforms.includes("WhatsApp");

  const onSubmit = async (data: SessionTypeFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Attempting to add session type:', data);

      const { data: existingType, error: checkError } = await supabase
        .from('mentor_session_types')
        .select('id, type')
        .eq('profile_id', profileId)
        .eq('type', data.type)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing type:', checkError);
        throw checkError;
      }

      console.log('Existing type check result:', existingType);

      if (existingType) {
        toast({
          title: "Error",
          description: "You already have this session type",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('mentor_session_types')
        .insert({
          profile_id: profileId,
          type: data.type,
          duration: Number(data.duration),
          price: 0,
          description: data.description || null,
          meeting_platform: data.meeting_platform,
          telegram_username: data.telegram_username || null,
          phone_number: data.phone_number || null,
        });

      if (error) {
        console.error('Error creating session type:', error);
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['mentor-session-types', profileId] });

      toast({
        title: "Success",
        description: "Session type created successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to create session type",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSessionTypes = existingTypes.map(type => type.type as SessionTypeEnum);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <SessionTypeSelect
              form={{ control: methods.control }}
              availableTypes={availableSessionTypes}
            />

            <FormField
              control={methods.control}
              name="duration"
              rules={{ required: "Duration is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
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

            <PlatformSelect form={{ control: methods.control }} />

            <PlatformFields
              form={{ control: methods.control }}
              showTelegramField={showTelegramField}
              showPhoneField={showPhoneField}
              showWhatsAppField={showWhatsAppField}
            />
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
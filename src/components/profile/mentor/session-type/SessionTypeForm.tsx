import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SessionTypeFormProps, SessionTypeFormData } from "./types";
import { SessionTypeSelect } from "./SessionTypeSelect";
import { PlatformSelect } from "./PlatformSelect";
import { PlatformFields } from "./PlatformFields";
import { useQueryClient } from "@tanstack/react-query";
import { useUserSettings } from "@/hooks/useUserSettings";

// Valid meeting platforms based on database schema
type MeetingPlatform = "Google Meet" | "WhatsApp" | "Telegram" | "Phone Call";

export function SessionTypeForm({ profileId, onSuccess, onCancel, existingTypes }: SessionTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getSetting } = useUserSettings(profileId);
  
  const methods = useForm<SessionTypeFormData>({
    defaultValues: {
      type: '',
      duration: 30,
      price: 0,
      description: "",
      meeting_platform: [] as string[],
      telegram_username: "",
      phone_number: "",
      custom_type_name: "",
    }
  });
  
  // Get mentor's default settings on component mount
  useEffect(() => {
    const loadDefaultSettings = async () => {
      try {
        const sessionSettingsStr = getSetting('session_settings');
        
        if (sessionSettingsStr) {
          const sessionSettings = JSON.parse(sessionSettingsStr);
          
          // Update form with mentor's default settings
          methods.setValue('duration', sessionSettings.defaultSessionDuration || 30);
          
          // Set default meeting platform from mentor settings
          if (sessionSettings.defaultMeetingPlatform) {
            methods.setValue('meeting_platform', [sessionSettings.defaultMeetingPlatform]);
            
            // Set default contact information based on platform
            if (sessionSettings.defaultMeetingPlatform === 'Telegram' && sessionSettings.customMeetingPlatform) {
              methods.setValue('telegram_username', sessionSettings.customMeetingPlatform);
            } else if ((sessionSettings.defaultMeetingPlatform === 'WhatsApp' || 
                      sessionSettings.defaultMeetingPlatform === 'Phone Call') && 
                      sessionSettings.customMeetingPlatform) {
              methods.setValue('phone_number', sessionSettings.customMeetingPlatform);
            }
          }
        }
      } catch (error) {
        console.error('Error loading default session settings:', error);
      }
    };
    
    loadDefaultSettings();
  }, [getSetting, methods]);

  const selectedPlatforms = methods.watch("meeting_platform") || [];
  const selectedType = methods.watch("type");
  const showTelegramField = selectedPlatforms.includes("Telegram");
  const showPhoneField = selectedPlatforms.includes("Phone Call");
  const showWhatsAppField = selectedPlatforms.includes("WhatsApp");
  const isCustomType = selectedType === "Custom";

  const onSubmit = async (data: SessionTypeFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Attempting to add session type:', data);

      if (data.type === "Custom" && (!data.custom_type_name || data.custom_type_name.trim() === "")) {
        toast({
          title: "Error",
          description: "Please provide a name for your custom session type",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check for existing custom type with the same name
      if (data.type === "Custom") {
        const { data: existingType, error: checkError } = await supabase
          .from('mentor_session_types')
          .select('id, type, custom_type_name')
          .eq('profile_id', profileId)
          .eq('type', 'Custom')
          .eq('custom_type_name', data.custom_type_name)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing type:', checkError);
          throw checkError;
        }

        if (existingType) {
          toast({
            title: "Error",
            description: "You already have a custom session type with this name",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        // Check for existing standard type
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

        if (existingType) {
          toast({
            title: "Error",
            description: "You already have this session type",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Create new session type with correct field names
      const sessionData = {
        profile_id: profileId,
        type: data.type,
        duration: Number(data.duration),
        price: 0,
        description: data.description || null,
        meeting_platform: data.meeting_platform as MeetingPlatform[],
        telegram_username: showTelegramField ? data.telegram_username || null : null,
        phone_number: (showPhoneField || showWhatsAppField) ? data.phone_number || null : null,
        custom_type_name: data.type === "Custom" ? data.custom_type_name : null,
      };

      console.log('Submitting session type data:', sessionData);

      const { data: newSessionType, error } = await supabase
        .from('mentor_session_types')
        .insert(sessionData)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating session type:', error);
        toast({
          title: "Error",
          description: `Failed to create session type: ${error.message}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Successfully created session type:', newSessionType);
      
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
        description: error instanceof Error ? error.message : "Failed to create session type",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <SessionTypeSelect
              form={methods}
              availableTypes={existingTypes?.map(type => type.type) || []}
            />

            {isCustomType && (
              <FormField
                control={methods.control}
                name="custom_type_name"
                rules={{ required: "Custom type name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Type Name</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter your custom session type" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <PlatformSelect form={methods} />

            <PlatformFields
              form={methods}
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

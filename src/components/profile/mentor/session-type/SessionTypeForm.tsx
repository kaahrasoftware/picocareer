import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SESSION_TYPE_OPTIONS } from "@/types/session";
import type { SessionTypeEnum } from "@/types/session";
import type { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeFormProps {
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingTypes: SessionType[];
}

interface FormData {
  type: SessionTypeEnum;
  duration: number;
  description: string;
  meeting_platform: ("Google Meet" | "WhatsApp" | "Telegram" | "Phone Call")[];
  telegram_username?: string;
  phone_number?: string;
}

export function SessionTypeForm({ profileId, onSuccess, onCancel, existingTypes }: SessionTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      meeting_platform: ["Google Meet"],
    }
  });

  const availableTypes = SESSION_TYPE_OPTIONS.filter(
    type => !existingTypes.some(existing => existing.type === type)
  );

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting session type:', data);

      const { error } = await supabase
        .from('mentor_session_types')
        .insert({
          profile_id: profileId,
          type: data.type,
          duration: data.duration,
          price: 0, // Default price set to 0
          description: data.description || null,
          meeting_platform: data.meeting_platform,
          telegram_username: data.telegram_username || null,
          phone_number: data.phone_number || null
        })
        .select()
        .single();

      if (error) throw error;

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

  const selectedPlatforms = form.watch("meeting_platform") || [];
  const showTelegramField = selectedPlatforms.includes("Telegram");
  const showPhoneField = selectedPlatforms.includes("Phone Call");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="type"
          rules={{ required: "Session type is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="meeting_platform"
          rules={{ required: "At least one platform is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Platform</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange([value])}
                  defaultValue={field.value?.[0]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Telegram">Telegram</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showTelegramField && (
          <FormField
            control={form.control}
            name="telegram_username"
            rules={{ required: "Telegram username is required for Telegram sessions" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telegram Username</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="@username"
                    onChange={(e) => {
                      let value = e.target.value;
                      if (!value.startsWith('@') && value) {
                        value = '@' + value;
                      }
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {showPhoneField && (
          <FormField
            control={form.control}
            name="phone_number"
            rules={{ required: "Phone number is required for phone call sessions" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+1234567890" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
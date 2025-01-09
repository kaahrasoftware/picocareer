import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SessionTypeSelect } from "./SessionTypeSelect";
import { PlatformFields } from "./PlatformFields";
import { SessionTypeFormData, SessionType, MeetingPlatform } from "@/types/session";
import { supabase } from "@/integrations/supabase/client";

interface SessionTypeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  profileId: string;
  existingTypes?: SessionTypeFormData[];
}

export function SessionTypeForm({ onSuccess, onCancel, profileId, existingTypes }: SessionTypeFormProps) {
  const form = useForm<SessionTypeFormData>({
    defaultValues: {
      type: "Know About my Career",
      duration: 30,
      price: 0,
      description: "",
      meeting_platform: ["Google Meet"],
    },
  });

  const onSubmit = async (data: SessionTypeFormData) => {
    try {
      const { error } = await supabase
        .from("mentor_session_types")
        .insert({
          profile_id: profileId,
          type: data.type,
          duration: data.duration,
          price: data.price,
          description: data.description,
          meeting_platform: data.meeting_platform,
          telegram_username: data.telegram_username,
          phone_number: data.phone_number,
          whatsapp_number: data.whatsapp_number,
        });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error("Error creating session type:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SessionTypeSelect control={form.control} />
        <PlatformFields form={{ control: form.control }} />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
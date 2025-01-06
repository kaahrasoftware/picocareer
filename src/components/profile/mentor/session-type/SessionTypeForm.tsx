import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PlatformFields } from "./PlatformFields";
import { SessionTypeFormData } from "./types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SessionTypeFormProps {
  onSuccess: () => void;
  profileId: string;
}

export function SessionTypeForm({ onSuccess, profileId }: SessionTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SessionTypeFormData>({
    defaultValues: {
      type: "",
      duration: 30,
      price: 0,
      description: "",
      meeting_platform: [],
      telegram_username: "",
      phone_number: ""
    }
  });

  const onSubmit = async (data: SessionTypeFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('mentor_session_types')
        .insert({
          profile_id: profileId,
          type: data.type,
          duration: data.duration,
          price: data.price,
          description: data.description,
          meeting_platform: data.meeting_platform,
          telegram_username: data.telegram_username,
          phone_number: data.phone_number
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session type created successfully",
      });
      
      onSuccess();
      form.reset();
    } catch (error) {
      console.error('Error creating session type:', error);
      toast({
        title: "Error",
        description: "Failed to create session type",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PlatformFields control={form.control} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Session Type"}
        </Button>
      </form>
    </Form>
  );
}
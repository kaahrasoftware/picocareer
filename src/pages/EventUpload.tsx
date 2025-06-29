
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { NewEventUploadForm } from "@/components/forms/event/NewEventUploadForm";
import type { EventFormData } from "@/components/forms/event/types";

export default function EventUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, loading } = useAuthSession('required');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: EventFormData) => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an event.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert form data to match database schema
      const eventData = {
        title: data.title,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        timezone: data.timezone,
        location: data.location,
        max_attendees: data.max_attendees,
        event_type: data.event_type,
        platform: data.platform,
        meeting_link: data.meeting_link || null,
        facilitator: data.facilitator || null,
        organized_by: data.organized_by || null,
        thumbnail_url: data.thumbnail_url || null,
        created_by: session.user.id,
        status: 'Pending'
      };

      const { data: eventResult, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Event created successfully and is pending approval.",
      });

      navigate("/events");
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-6xl">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-1"
        onClick={() => navigate("/events")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Button>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground">
          Create an engaging event for the PicoCareer community with our step-by-step form.
        </p>
      </div>

      <NewEventUploadForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

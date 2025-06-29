
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { EventUploadForm } from "@/components/forms/event/EventUploadForm";

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

  const handleSubmit = async (data: any) => {
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
      const { data: eventData, error } = await supabase
        .from('events')
        .insert({
          title: data.title,
          description: data.description,
          event_date: data.event_date,
          location: data.location,
          max_attendees: data.max_attendees,
          event_type: data.event_type,
          image_url: data.image_url,
          created_by: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Event created successfully.",
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
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-1"
        onClick={() => navigate("/events")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill out the form below to create a new event for the community.
        </p>
      </div>

      <EventUploadForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function EventUpload() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { toast } = useToast();

  useEffect(() => {
    if (profile && profile.user_type !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can access this page",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [profile, navigate, toast]);

  // If profile is not loaded yet, don't redirect
  if (!profile) return null;

  // If user is not admin, don't render the form
  if (profile.user_type !== 'admin') return null;

  const fields = [
    {
      name: "title",
      label: "Event Title",
      placeholder: "Enter event title",
      description: "The title of your event",
      required: true,
    },
    {
      name: "description",
      label: "Event Description",
      type: "richtext",
      placeholder: "Enter event description",
      description: "Detailed description of the event",
      required: true,
    },
    {
      name: "start_time",
      label: "Start Time",
      type: "datetime-local",
      placeholder: "Select start time",
      description: "When does the event start?",
      required: true,
    },
    {
      name: "end_time",
      label: "End Time",
      type: "datetime-local",
      placeholder: "Select end time",
      description: "When does the event end?",
      required: true,
    },
    {
      name: "event_type",
      label: "Event Type",
      type: "select",
      options: ["Coffee Time", "Hackathon", "Panel", "Webinar", "Workshop"],
      placeholder: "Select event type",
      description: "Type of event",
      required: true,
    },
    {
      name: "platform",
      label: "Platform",
      type: "select",
      options: ["Google Meet", "Zoom"],
      placeholder: "Select platform",
      description: "Platform where the event will be hosted",
      required: true,
    },
    {
      name: "meeting_link",
      label: "Meeting Link",
      placeholder: "Enter meeting link",
      description: "Link to join the event",
      required: false,
    },
    {
      name: "max_attendees",
      label: "Maximum Attendees",
      type: "number",
      placeholder: "Enter maximum number of attendees",
      description: "Maximum number of participants (optional)",
      required: false,
    },
    {
      name: "thumbnail_url",
      label: "Thumbnail Image",
      type: "image",
      bucket: "Event_Posts",
      placeholder: "Upload event thumbnail",
      description: "Event thumbnail image",
      required: false,
    },
    {
      name: "organized_by",
      label: "Organized By",
      placeholder: "Enter organizer name",
      description: "Who is organizing this event?",
      required: false,
    },
    {
      name: "facilitator",
      label: "Facilitator",
      placeholder: "Enter facilitator name",
      description: "Who will be facilitating the event?",
      required: false,
    },
    {
      name: "timezone",
      label: "Timezone",
      placeholder: "Enter timezone (e.g., EST)",
      description: "Event timezone",
      defaultValue: "EST",
      required: true,
    }
  ];

  const handleSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          ...data,
          status: 'Pending',
          author_id: profile.id // Add the author_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      navigate('/event');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      <GenericUploadForm
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonText="Create Event"
      />
    </div>
  );
}
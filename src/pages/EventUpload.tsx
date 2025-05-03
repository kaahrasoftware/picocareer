
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface EventFormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  platform: 'Google Meet' | 'Zoom';
  meeting_link?: string;
  max_attendees?: number;
  thumbnail_url?: string;
  organized_by?: string;
  facilitator?: string;
  event_type: 'Coffee Time' | 'Hackathon' | 'Panel' | 'Webinar' | 'Workshop';
  timezone: string;
}

export default function EventUpload() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<EventFormData>();
  const [isFromDashboard, setIsFromDashboard] = useState(false);

  const platformOptions = [
    { id: 'Google Meet', name: 'Google Meet' },
    { id: 'Zoom', name: 'Zoom' }
  ];

  const eventTypeOptions = [
    { id: 'Coffee Time', name: 'Coffee Time' },
    { id: 'Hackathon', name: 'Hackathon' },
    { id: 'Panel', name: 'Panel' },
    { id: 'Webinar', name: 'Webinar' },
    { id: 'Workshop', name: 'Workshop' }
  ];

  useEffect(() => {
    // Check if we're coming from the dashboard
    const referrer = document.referrer;
    if (referrer && referrer.includes('/dashboard')) {
      setIsFromDashboard(true);
    }
  }, []);

  const onSubmit = async (data: EventFormData) => {
    if (!session?.user) {
      toast.error("You must be logged in to submit an event");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          author_id: session.user.id,
          status: 'Pending',
          ...data
        });

      if (error) throw error;

      toast.success("Event has been submitted for review");
      form.reset();
      
      // If coming from dashboard, redirect back
      if (isFromDashboard) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error submitting event:', error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (profile && profile.user_type !== 'admin') {
      toast.error("Only administrators can access this page");
      navigate('/');
    }
  }, [profile, navigate]);

  if (!profile) return null;
  if (profile.user_type !== 'admin') return null;

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        
        {isFromDashboard && (
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        )}
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            label="Event Title"
            placeholder="Enter event title"
            required
          />

          <FormField
            control={form.control}
            name="description"
            label="Event Description"
            type="richtext"
            component={RichTextEditor}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              label="Start Time"
              type="datetime-local"
              required
            />

            <FormField
              control={form.control}
              name="end_time"
              label="End Time"
              type="datetime-local"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="platform"
              label="Meeting Platform"
              type="select"
              options={platformOptions}
              required
            />

            <FormField
              control={form.control}
              name="event_type"
              label="Event Category"
              type="select"
              options={eventTypeOptions}
              required
            />
          </div>

          <FormField
            control={form.control}
            name="meeting_link"
            label="Meeting Link"
            placeholder="Enter meeting link"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="max_attendees"
              label="Maximum Attendees"
              type="number"
              placeholder="Enter maximum number of attendees"
            />

            <FormField
              control={form.control}
              name="timezone"
              label="Timezone"
              placeholder="Enter timezone (e.g., EST)"
              required
            />
          </div>

          <FormField
            control={form.control}
            name="thumbnail_url"
            label="Event Image"
            type="image"
            bucket="Event_Posts"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="organized_by"
              label="Organized By"
              placeholder="Enter organizer name"
            />

            <FormField
              control={form.control}
              name="facilitator"
              label="Facilitator"
              placeholder="Enter facilitator name"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Event'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

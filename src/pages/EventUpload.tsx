
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormRichEditor } from "@/components/FormRichEditor";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  platform: z.enum(['Google Meet', 'Zoom']),
  meeting_link: z.string().optional(),
  max_attendees: z.number().optional(),
  thumbnail_url: z.string().optional(),
  organized_by: z.string().optional(),
  facilitator: z.string().optional(),
  event_type: z.enum(['Coffee Time', 'Hackathon', 'Panel', 'Webinar', 'Workshop']),
  timezone: z.string().min(1, "Timezone is required"),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function EventUpload() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFromDashboard, setIsFromDashboard] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      platform: "Google Meet",
      meeting_link: "",
      max_attendees: undefined,
      thumbnail_url: "",
      organized_by: "",
      facilitator: "",
      event_type: "Webinar",
      timezone: "EST",
    },
  });

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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event title" {...field} />
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
                <FormLabel>Event Description *</FormLabel>
                <FormControl>
                  <FormRichEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter event description"
                    uploadConfig={{
                      bucket: "Event_Posts",
                      folderPath: "descriptions/"
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Platform *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Coffee Time">Coffee Time</SelectItem>
                      <SelectItem value="Hackathon">Hackathon</SelectItem>
                      <SelectItem value="Panel">Panel</SelectItem>
                      <SelectItem value="Webinar">Webinar</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="meeting_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Link</FormLabel>
                <FormControl>
                  <Input placeholder="Enter meeting link" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="max_attendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Attendees</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter maximum number of attendees"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter timezone (e.g., EST)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="thumbnail_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    control={form.control}
                    name="thumbnail_url"
                    label=""
                    bucket="Event_Posts"
                    accept="image/*"
                    folderPath="thumbnails/"
                    onUploadSuccess={(url) => field.onChange(url)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="organized_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organized By</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organizer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facilitator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facilitator</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter facilitator name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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

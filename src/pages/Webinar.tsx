import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WebinarRegistrationForm } from "@/components/forms/WebinarRegistrationForm";
import { WebinarHeader } from "@/components/webinar/WebinarHeader";
import { WebinarCard } from "@/components/webinar/WebinarCard";
import { EmptyState } from "@/components/webinar/EmptyState";

interface Webinar {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  platform: 'Google Meet' | 'Zoom';
  meeting_link?: string;
  max_attendees?: number;
  thumbnail_url?: string;
}

export default function Webinar() {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [registering, setRegistering] = useState<string | null>(null);
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  // Query for webinars - available to all users
  const { data: webinars, isLoading } = useQuery({
    queryKey: ['webinars', filter],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .eq('status', 'Approved')
        .gte('start_time', filter === 'upcoming' ? now : '2000-01-01')
        .lt('start_time', filter === 'upcoming' ? '2100-01-01' : now)
        .order('start_time', { ascending: filter === 'upcoming' });

      if (error) throw error;
      return data as Webinar[];
    }
  });

  // Query for registrations - only runs when user is authenticated
  const { data: registrations } = useQuery({
    queryKey: ['webinar-registrations', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('webinar_registrations')
        .select('webinar_id')
        .eq('profile_id', session.user.id);

      if (error) throw error;
      return data.map(r => r.webinar_id);
    },
    enabled: !!session?.user?.id
  });

  const handleRegister = async (webinarId: string) => {
    const webinar = webinars?.find(w => w.id === webinarId);
    if (webinar) {
      setSelectedWebinar(webinar);
    }
  };

  const handleRegistrationSubmit = async (formData: any) => {
    if (!selectedWebinar) return;

    setRegistering(selectedWebinar.id);
    try {
      // First check if the email is already registered for this webinar
      const { data: existingRegistration, error: checkError } = await supabase
        .from('webinar_registrations')
        .select('id')
        .eq('webinar_id', selectedWebinar.id)
        .eq('email', formData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw checkError;
      }

      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You have already registered for this webinar with this email address.",
          variant: "destructive",
        });
        setSelectedWebinar(null);
        return;
      }

      // If no existing registration, proceed with registration
      const { error: insertError } = await supabase
        .from('webinar_registrations')
        .insert({
          webinar_id: selectedWebinar.id,
          profile_id: session?.user?.id || null,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          "current academic field/position": formData.current_field,
          student_or_professional: formData.student_or_professional,
          "current school/company": formData.current_organization,
          country: formData.country,
          "where did you hear about us": formData.hear_about_us
        });

      if (insertError) throw insertError;

      toast({
        title: "Registration Successful",
        description: "You have been registered for the webinar",
      });
      setSelectedWebinar(null);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for the webinar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegistering(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Loading webinars...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <WebinarHeader filter={filter} onFilterChange={setFilter} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {webinars?.map((webinar) => (
            <WebinarCard
              key={webinar.id}
              webinar={webinar}
              isRegistering={registering === webinar.id}
              isRegistered={registrations?.includes(webinar.id) || false}
              isPast={filter === 'past'}
              onRegister={handleRegister}
            />
          ))}
        </div>

        {webinars?.length === 0 && <EmptyState filter={filter} />}
      </div>

      <Dialog open={!!selectedWebinar} onOpenChange={() => setSelectedWebinar(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register for Webinar</DialogTitle>
          </DialogHeader>
          {selectedWebinar && (
            <WebinarRegistrationForm
              webinarId={selectedWebinar.id}
              onSubmit={handleRegistrationSubmit}
              onCancel={() => setSelectedWebinar(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
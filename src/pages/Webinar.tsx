import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Calendar, Clock, Users, Video } from "lucide-react";
import { format } from "date-fns";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WebinarRegistrationForm } from "@/components/forms/WebinarRegistrationForm";

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

  // Query for webinars - available to all users
  const { data: webinars, isLoading } = useQuery({
    queryKey: ['webinars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .eq('status', 'Approved')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

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
    if (!session?.user?.id || !selectedWebinar) return;

    setRegistering(selectedWebinar.id);
    try {
      const { error } = await supabase
        .from('webinar_registrations')
        .insert({
          webinar_id: selectedWebinar.id,
          profile_id: session.user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          "current academic field/position": formData.current_field,
          student_or_professional: formData.student_or_professional,
          "current school/company": formData.current_organization,
          country: formData.country,
          "where did you hear about us": formData.hear_about_us
        });

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: "You have been registered for the webinar",
      });
      setSelectedWebinar(null);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for the webinar. Please try again.",
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
        <div>
          <h1 className="text-3xl font-bold">Upcoming Webinars</h1>
          <p className="text-muted-foreground mt-2">
            Join our interactive webinars to learn from industry experts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {webinars?.map((webinar) => (
            <Card key={webinar.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{webinar.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(webinar.start_time), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">{webinar.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {format(new Date(webinar.start_time), 'p')} - {format(new Date(webinar.end_time), 'p')}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4" />
                    {webinar.platform}
                  </div>
                  {webinar.max_attendees && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      Limited to {webinar.max_attendees} attendees
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleRegister(webinar.id)}
                  disabled={registering === webinar.id || registrations?.includes(webinar.id)}
                >
                  {registering === webinar.id 
                    ? "Registering..." 
                    : registrations?.includes(webinar.id)
                      ? "Registered"
                      : "Register Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {webinars?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No Upcoming Webinars</h3>
            <p className="text-muted-foreground">Check back later for new webinars</p>
          </div>
        )}
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

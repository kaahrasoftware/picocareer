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
    if (!session || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for webinars",
        variant: "destructive",
      });
      return;
    }

    setRegistering(webinarId);
    try {
      const { error } = await supabase
        .from('webinar_registrations')
        .insert({
          webinar_id: webinarId,
          profile_id: session.user.id,
          email: profile.email // Include the user's email from their profile
        });

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: "You have been registered for the webinar",
      });
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
    </div>
  );
}
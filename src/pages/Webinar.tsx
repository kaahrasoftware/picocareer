import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function Webinar() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [registering, setRegistering] = useState<string | null>(null);

  // Query webinars without authentication check
  const { data: webinars = [], isLoading } = useQuery({
    queryKey: ['webinars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching webinars:', error);
        return [];
      }

      return data;
    }
  });

  // Only fetch registrations if user is authenticated
  const { data: registrations = [] } = useQuery({
    queryKey: ['webinar-registrations', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webinar_registrations')
        .select('webinar_id')
        .eq('profile_id', session.user.id);

      if (error) {
        console.error('Error fetching registrations:', error);
        return [];
      }

      return data.map(reg => reg.webinar_id);
    }
  });

  const handleRegister = async (webinarId: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for webinars",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!profile?.email) {
      toast({
        title: "Error",
        description: "Your profile email is required for registration",
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
          email: profile.email
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "You have successfully registered for the webinar",
      });

    } catch (error) {
      console.error('Error registering for webinar:', error);
      toast({
        title: "Error",
        description: "Failed to register for the webinar",
        variant: "destructive",
      });
    } finally {
      setRegistering(null);
    }
  };

  if (isLoading) {
    return <div>Loading webinars...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Upcoming Webinars</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webinars.map((webinar) => (
          <Card key={webinar.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{webinar.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">{webinar.description}</p>
              <div className="space-y-2">
                <p>
                  <strong>Date:</strong>{" "}
                  {format(new Date(webinar.start_time), "MMMM d, yyyy")}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {format(new Date(webinar.start_time), "h:mm a")} -{" "}
                  {format(new Date(webinar.end_time), "h:mm a")}
                </p>
                <p>
                  <strong>Platform:</strong> {webinar.platform}
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handleRegister(webinar.id)}
                disabled={registering === webinar.id || registrations.includes(webinar.id)}
              >
                {!session ? "Sign in to Register" :
                  registering === webinar.id 
                    ? "Registering..." 
                    : registrations.includes(webinar.id)
                      ? "Registered"
                      : "Register Now"
                }
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
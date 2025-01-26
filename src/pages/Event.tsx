import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { EventRegistrationForm } from "@/components/events/EventRegistrationForm";
import { EventDetails } from "@/components/events/EventDetails";
import { EventRegistrationFormData } from "@/types/events";
import { Skeleton } from "@/components/ui/skeleton";

export default function Event() {
  const { eventId } = useParams<{ eventId: string }>();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();

  const { data: selectedEvent, refetch: refetchEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          registrations:event_registrations(count)
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const handleRegistration = async (formData: EventRegistrationFormData) => {
    if (!selectedEvent) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if user is already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', selectedEvent.id)
        .eq('email', formData.email)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this event.",
          variant: "destructive"
        });
        return;
      }

      // Create registration
      const { data: registration, error: registrationError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: selectedEvent.id,
          profile_id: session?.user?.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          "current academic field/position": formData.current_field,
          student_or_professional: formData.student_or_professional,
          "current school/company": formData.current_institution,
          country: formData.country,
          "where did you hear about us": formData.referral_source
        })
        .select()
        .single();

      if (registrationError) throw registrationError;

      // Send confirmation email
      const { error: confirmationError } = await supabase.functions.invoke(
        'send-event-confirmation',
        {
          body: { registrationId: registration.id }
        }
      );

      if (confirmationError) {
        console.error('Error sending confirmation:', confirmationError);
        toast({
          title: "Registration Successful",
          description: "You're registered, but there was an issue sending the confirmation email. Please check your spam folder.",
          variant: "default"
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "You've been registered for the event. Check your email for confirmation details.",
          variant: "default"
        });
      }

      setShowRegistrationForm(false);
      refetchEvent();

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedEvent) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <EventDetails
        event={selectedEvent}
        onRegister={() => setShowRegistrationForm(true)}
      />

      <EventRegistrationForm
        event={selectedEvent}
        isOpen={showRegistrationForm}
        onClose={() => setShowRegistrationForm(false)}
        onSubmit={handleRegistration}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
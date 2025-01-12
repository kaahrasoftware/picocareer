import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { TimeSlotForm } from "./availability/TimeSlotForm";
import { ExistingTimeSlots } from "./availability/ExistingTimeSlots";
import { UnavailableTimeForm } from "./availability/UnavailableTimeForm";
import type { Availability } from "@/types/session";

interface AvailabilityManagerProps {
  profileId: string;
}

export function AvailabilityManager({ profileId }: AvailabilityManagerProps) {
  const [availabilitySlots, setAvailabilitySlots] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUnavailableForm, setShowUnavailableForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailability();
  }, [profileId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', profileId)
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Transform the data to match the Availability type
      const transformedData = data.map(slot => ({
        id: slot.id,
        profile_id: slot.profile_id,
        is_available: slot.is_available,
        recurring: slot.recurring,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        created_at: slot.created_at,
        updated_at: slot.updated_at
      }));

      setAvailabilitySlots(transformedData);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability slots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = async (newSlot: Partial<Availability>) => {
    try {
      const { data, error } = await supabase
        .from('mentor_availability')
        .insert([newSlot])
        .select()
        .single();

      if (error) throw error;

      setAvailabilitySlots(prev => [...prev, data as Availability]);
      setShowForm(false);
      toast({
        title: "Success",
        description: "Availability slot added successfully",
      });
    } catch (error) {
      console.error('Error adding availability slot:', error);
      toast({
        title: "Error",
        description: "Failed to add availability slot",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAvailabilitySlots(prev => prev.filter(slot => slot.id !== id));
      toast({
        title: "Success",
        description: "Availability slot deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting availability slot:', error);
      toast({
        title: "Error",
        description: "Failed to delete availability slot",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          Add Available Time
        </Button>
        <Button 
          onClick={() => setShowUnavailableForm(true)} 
          disabled={showUnavailableForm}
          variant="outline"
        >
          Mark Unavailable Time
        </Button>
      </div>

      {showForm && (
        <TimeSlotForm
          profileId={profileId}
          onSubmit={handleAddSlot}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showUnavailableForm && (
        <UnavailableTimeForm
          profileId={profileId}
          onSubmit={handleAddSlot}
          onCancel={() => setShowUnavailableForm(false)}
        />
      )}

      <ExistingTimeSlots
        slots={availabilitySlots}
        onDelete={handleDeleteSlot}
        isLoading={isLoading}
      />
    </div>
  );
}
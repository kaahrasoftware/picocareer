
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExistingTimeSlotsProps {
  profile_id: string;
  onUpdate: () => void;
}

export function ExistingTimeSlots({ profile_id, onUpdate }: ExistingTimeSlotsProps) {
  const { toast } = useToast();
  
  const { data: timeSlots, isLoading, refetch } = useQuery({
    queryKey: ['mentor-availability', profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', profile_id)
        .eq('is_recurring', true)
        .order('day_of_week');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot deleted successfully",
      });

      refetch();
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete time slot",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading existing time slots...</div>;
  }

  if (!timeSlots || timeSlots.length === 0) {
    return <div>No recurring time slots configured.</div>;
  }

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Existing Time Slots</h3>
      <div className="space-y-2">
        {timeSlots.map((slot) => (
          <div key={slot.id} className="flex items-center justify-between p-3 border rounded">
            <div>
              <span className="font-medium">{DAYS[slot.day_of_week]}</span>
              <span className="ml-2">
                {formatDateTime(slot.start_date_time)} - {formatDateTime(slot.end_date_time)}
              </span>
              {slot.timezone && (
                <span className="ml-2 text-sm text-gray-500">({slot.timezone})</span>
              )}
            </div>
            <Button
              onClick={() => handleDelete(slot.id)}
              variant="destructive"
              size="sm"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

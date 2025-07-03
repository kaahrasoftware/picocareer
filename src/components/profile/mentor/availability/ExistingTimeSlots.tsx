
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ExistingTimeSlotsProps {
  profileId: string;
  onEdit?: (slot: any) => void;
  onRefresh?: () => void;
}

export function ExistingTimeSlots({ profileId, onEdit, onRefresh }: ExistingTimeSlotsProps) {
  const { data: timeSlots, isLoading, refetch } = useQuery({
    queryKey: ['mentor-availability', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_available', true)
        .gte('start_date_time', new Date().toISOString())
        .order('start_date_time', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  const handleDelete = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('id', slotId);
      
      if (error) throw error;
      
      refetch();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting time slot:', error);
    }
  };

  if (isLoading) {
    return <div>Loading time slots...</div>;
  }

  if (!timeSlots || timeSlots.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No available time slots</h3>
          <p className="text-muted-foreground text-center">
            Add your first available time slot to start accepting bookings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Your Available Time Slots
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {timeSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <div className="font-medium">
                    {format(new Date(slot.start_date_time), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(slot.start_date_time), 'h:mm a')} - 
                    {format(new Date(slot.end_date_time), 'h:mm a')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(slot)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(slot.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

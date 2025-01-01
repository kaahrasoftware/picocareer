import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SessionTypeCard } from "./session-type/SessionTypeCard";
import { SessionTypeForm } from "./session-type/SessionTypeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { SessionTypeEnum } from "@/types/session";
import type { MeetingPlatform } from "@/types/calendar";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeManagerProps {
  profileId: string;
  sessionTypes: SessionType[];
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, sessionTypes = [], onUpdate }: SessionTypeManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch session types
  const { data: fetchedSessionTypes = [], isLoading } = useQuery({
    queryKey: ['mentor-session-types', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  const handleAddSessionType = async (data: {
    type: SessionTypeEnum;
    duration: string;
    price: string;
    description: string;
    meeting_platform: MeetingPlatform[];
    telegram_username?: string;
    phone_number?: string;
  }) => {
    try {
      console.log('Adding session type:', data);
      console.log('Current session types:', fetchedSessionTypes);

      // Check if session type with same type and duration exists
      const { data: existingType, error: checkError } = await supabase
        .from('mentor_session_types')
        .select('id, type, duration')
        .eq('profile_id', profileId)
        .eq('type', data.type)
        .eq('duration', parseInt(data.duration))
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing session type:', checkError);
        throw checkError;
      }

      if (existingType) {
        console.log('Found existing session type:', existingType);
        toast({
          title: "Session type exists",
          description: `You already have a ${data.type} session type with ${data.duration} minutes duration.`,
          variant: "destructive",
        });
        return;
      }

      // Format the data according to the database schema
      const sessionTypeData = {
        profile_id: profileId,
        type: data.type,
        duration: parseInt(data.duration),
        price: 0.00, // Default price set to 0.00
        description: data.description || null,
        meeting_platform: data.meeting_platform,
        telegram_username: data.telegram_username || null,
        phone_number: data.phone_number || null
      };

      console.log('Submitting session type data:', sessionTypeData);

      const { error } = await supabase
        .from('mentor_session_types')
        .insert(sessionTypeData);

      if (error) {
        console.error('Error adding session type:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Session type added successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['mentor-session-types'] });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding session type:', error);
      toast({
        title: "Error",
        description: "Failed to add session type",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSessionType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentor_session_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session type deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['mentor-session-types'] });
    } catch (error) {
      console.error('Error deleting session type:', error);
      toast({
        title: "Error",
        description: "Failed to delete session type",
        variant: "destructive",
      });
    }
  };

  // Get unique types from fetched session types
  const existingTypes = fetchedSessionTypes.map(st => st.type);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-[200px] border-dashed flex flex-col gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-6 w-6" />
          Add Session Type
        </Button>
        {fetchedSessionTypes.map((sessionType) => (
          <SessionTypeCard
            key={sessionType.id}
            sessionType={sessionType}
            onDelete={handleDeleteSessionType}
          />
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Session Type</DialogTitle>
            <DialogDescription>
              Configure a new type of mentoring session that mentees can book with you.
            </DialogDescription>
          </DialogHeader>
          <SessionTypeForm
            onSubmit={handleAddSessionType}
            onCancel={() => setShowForm(false)}
            existingTypes={existingTypes}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
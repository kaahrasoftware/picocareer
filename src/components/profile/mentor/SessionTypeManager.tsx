import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SessionTypeCard } from "./session-type/SessionTypeCard";
import { SessionTypeForm } from "./session-type/SessionTypeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];
type SessionTypeEnum = Database["public"]["Enums"]["session_type"];

interface SessionTypeManagerProps {
  profileId: string;
  sessionTypes: SessionType[];
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, sessionTypes = [], onUpdate }: SessionTypeManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleAddSessionType = async (data: {
    type: SessionTypeEnum;
    duration: string;
    price: string;
    description: string;
  }) => {
    try {
      // Check if this session type already exists for this mentor
      const { data: existingType, error: checkError } = await supabase
        .from('mentor_session_types')
        .select('id')
        .eq('profile_id', profileId)
        .eq('type', data.type)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingType) {
        toast({
          title: "Session type exists",
          description: "You already have this type of session configured.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('mentor_session_types')
        .insert({
          profile_id: profileId,
          type: data.type,
          duration: parseInt(data.duration),
          price: parseFloat(data.price),
          description: data.description,
          meeting_platform: ['google_meet']
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session type added successfully",
      });

      onUpdate();
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

      onUpdate();
    } catch (error) {
      console.error('Error deleting session type:', error);
      toast({
        title: "Error",
        description: "Failed to delete session type",
        variant: "destructive",
      });
    }
  };

  // Get array of session types that are already set
  const existingTypes = sessionTypes.map(st => st.type);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessionTypes.map((sessionType) => (
          <SessionTypeCard
            key={sessionType.id}
            sessionType={sessionType}
            onDelete={handleDeleteSessionType}
          />
        ))}
        <Button
          variant="outline"
          className="h-[200px] border-dashed flex flex-col gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-6 w-6" />
          Add Session Type
        </Button>
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
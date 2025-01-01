import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SessionTypeCard } from "./session-type/SessionTypeCard";
import { SessionTypeForm } from "./session-type/SessionTypeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionTypeSubmit } from "./session-type/hooks/useSessionTypeSubmit";
import { useSessionTypeDelete } from "./session-type/hooks/useSessionTypeDelete";
import type { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeManagerProps {
  profileId: string;
  sessionTypes: SessionType[];
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, sessionTypes = [], onUpdate }: SessionTypeManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const { handleSubmit } = useSessionTypeSubmit(profileId);
  const { handleDelete } = useSessionTypeDelete();

  const { data: fetchedSessionTypes = [], isLoading } = useQuery({
    queryKey: ['mentor-session-types', profileId],
    queryFn: async () => {
      console.log('Fetching session types for profile:', profileId);
      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw error;
      console.log('Fetched session types:', data);
      return data;
    },
    enabled: !!profileId
  });

  const handleAddSessionType = async (data: any) => {
    const success = await handleSubmit(data);
    if (success) {
      setShowForm(false);
      onUpdate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const existingTypes = fetchedSessionTypes.map(st => st.type);

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
            onDelete={handleDelete}
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
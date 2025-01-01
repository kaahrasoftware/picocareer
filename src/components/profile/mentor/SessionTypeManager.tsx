import { SessionTypeCard } from "./session-type/SessionTypeCard";
import { useSessionTypeManager } from "./hooks/useSessionTypeManager";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { SessionTypeForm } from "./session-type/SessionTypeForm";
import type { Database } from "@/integrations/supabase/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeManagerProps {
  profileId: string;
  sessionTypes: SessionType[];
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, sessionTypes = [], onUpdate }: SessionTypeManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const { sessionTypes: fetchedSessionTypes, isLoading, handleDeleteSessionType } = useSessionTypeManager(profileId);

  const handleFormSuccess = () => {
    setShowForm(false);
    onUpdate(); // Call onUpdate to refresh the parent component
  };

  const handleDelete = async (id: string) => {
    await handleDeleteSessionType(id);
    onUpdate(); // Refresh after deletion as well
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Session Type
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <SessionTypeForm
            profileId={profileId}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
            existingTypes={fetchedSessionTypes}
          />
        </DialogContent>
      </Dialog>

      {fetchedSessionTypes.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Session Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fetchedSessionTypes.map((sessionType) => (
              <SessionTypeCard
                key={sessionType.id}
                sessionType={sessionType}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>You haven't created any session types yet.</p>
          <p>Click the button above to add your first session type.</p>
        </div>
      )}
    </div>
  );
}
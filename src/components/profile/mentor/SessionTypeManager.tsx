import { useState } from "react";
import { SessionTypeForm } from "./session-type/SessionTypeForm";
import { useForm } from "react-hook-form";
import { SessionTypeFormData } from "./session-type/types";

interface SessionTypeManagerProps {
  profileId: string;
  sessionTypes: SessionTypeFormData[];
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, sessionTypes, onUpdate }: SessionTypeManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { control } = useForm<SessionTypeFormData>({
    defaultValues: {
      type: "Know About my Career",
      duration: 30,
      price: 0,
      description: "",
      meeting_platform: ["Google Meet"]
    }
  });

  const handleSuccess = () => {
    setIsEditing(false);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      {isEditing ? (
        <SessionTypeForm
          control={control}
          profileId={profileId}
          onSuccess={handleSuccess}
          onCancel={() => setIsEditing(false)}
          existingTypes={sessionTypes}
        />
      ) : (
        <div>
          {sessionTypes.map((session, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-semibold">{session.type}</h4>
              <p>Duration: {session.duration} minutes</p>
              <p>Price: ${session.price}</p>
              <p>Description: {session.description}</p>
              <p>Meeting Platform: {session.meeting_platform.join(", ")}</p>
            </div>
          ))}
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(true)}
          >
            Add Session Type
          </button>
        </div>
      )}
    </div>
  );
}

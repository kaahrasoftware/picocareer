import { MentorHeader } from "../mentor/MentorHeader";
import { useSession } from "@supabase/auth-helpers-react";

export function ProfileHeader() {
  const session = useSession();
  
  if (!session) {
    return null;
  }

  return (
    <MentorHeader
      name={session.user.email || ""}
      imageUrl={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`}
    />
  );
}
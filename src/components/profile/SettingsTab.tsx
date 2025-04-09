
import { useAuthSession } from "@/hooks/useAuthSession";
import { SettingsContainer } from "./settings/SettingsContainer";
import { useUserProfile } from "@/hooks/useUserProfile";

export function SettingsTab() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  
  return (
    <div className="w-full">
      <SettingsContainer profileId={profile?.id} />
    </div>
  );
}

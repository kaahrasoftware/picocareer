
import { useAuthSession } from "@/hooks/useAuthSession";
import { SettingsContainer } from "./settings/SettingsContainer";

export function SettingsTab() {
  const { user } = useAuthSession();
  
  return (
    <div className="w-full">
      <SettingsContainer />
    </div>
  );
}

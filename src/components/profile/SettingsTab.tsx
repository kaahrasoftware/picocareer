import { SettingsContainer } from "./settings/SettingsContainer";
import { ManualReferralProcessor } from "./ManualReferralProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
interface SettingsTabProps {
  profileId: string;
}
export function SettingsTab({
  profileId
}: SettingsTabProps) {
  return <div className="space-y-6">
      <SettingsContainer profileId={profileId} />
      
      
    </div>;
}

import { SettingsContainer } from "./settings/SettingsContainer";
import { ManualReferralProcessor } from "./ManualReferralProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsTabProps {
  profileId?: string;
}

export function SettingsTab({ profileId }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <SettingsContainer profileId={profileId} />
      
      <Card>
        <CardHeader>
          <CardTitle>Referral Code</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If someone referred you to PicoCareer, enter their referral code here.
          </p>
          <ManualReferralProcessor />
        </CardContent>
      </Card>
    </div>
  );
}

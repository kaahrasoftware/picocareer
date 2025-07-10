import { SettingsContainer } from "./settings/SettingsContainer";
import { ManualReferralProcessor } from "./ManualReferralProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function SettingsTab() {
  return <div className="space-y-6">
      <SettingsContainer />
      
      <Card>
        <CardHeader>
          <CardTitle>Referral Code</CardTitle>
        </CardHeader>
        
      </Card>
    </div>;
}
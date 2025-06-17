
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualReferralProcessor } from "@/components/profile/ManualReferralProcessor";
import { Users, Gift } from "lucide-react";

export function ReferralsTab() {
  return (
    <div className="space-y-6">
      {/* Manual Referral Processor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Enter Referral Code
          </CardTitle>
          <CardDescription>
            If someone referred you to PicoCareer, enter their referral code below to help them earn tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManualReferralProcessor />
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-4">How Referrals Work</h3>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-gray-600">
              <div>
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                <p>Get a referral code from a friend who is already using PicoCareer</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                <p>Enter their referral code above to help them earn 15 tokens for referring you!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Users className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-2">Referral System</h3>
              <p className="text-sm text-muted-foreground">
                Our referral system helps existing users earn tokens when they successfully refer new members to PicoCareer. 
                If someone referred you, make sure to enter their code to help them get rewarded for bringing you to our platform!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

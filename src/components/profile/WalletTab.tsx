
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletAnalytics } from "@/components/wallet/WalletAnalytics";
import { EarnUseTokensTab } from "@/components/wallet/EarnUseTokensTab";
import { ReferralsTab } from "@/components/wallet/ReferralsTab";
import { EnhancedTransactionHistory } from "@/components/wallet/EnhancedTransactionHistory";
import { ManualReferralProcessor } from "@/components/profile/ManualReferralProcessor";
import type { Profile } from "@/types/database/profiles";

interface WalletTabProps {
  profile: Profile | null;
}

export function WalletTab({ profile }: WalletTabProps) {
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading wallet information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WalletAnalytics profileId={profile.id} />
      
      <Tabs defaultValue="earn-use" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="earn-use">Earn & Use</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="refer-friend">Refer Friend</TabsTrigger>
        </TabsList>
        
        <TabsContent value="earn-use" className="space-y-4">
          <EarnUseTokensTab />
        </TabsContent>
        
        <TabsContent value="referrals" className="space-y-4">
          <ReferralsTab />
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <EnhancedTransactionHistory profileId={profile.id} />
        </TabsContent>

        <TabsContent value="refer-friend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refer a Friend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If someone referred you to PicoCareer, you can enter their referral code below to help them earn tokens.
              </p>
              <ManualReferralProcessor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReferralCode } from "@/hooks/useReferralCode";
import { useReferralStats } from "@/hooks/useReferralStats";
import { ManualReferralProcessor } from "@/components/profile/ManualReferralProcessor";
import { Users, Gift, Copy, Share2, Award } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function ReferralsTab() {
  const { data: referralCode, isLoading: codeLoading } = useReferralCode();
  const { stats, isLoading: statsLoading } = useReferralStats();
  const [copied, setCopied] = useState(false);

  const referralLink = referralCode ? `${window.location.origin}/auth?tab=signup&ref=${referralCode}` : '';

  const copyToClipboard = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareReferralLink = async () => {
    if (!referralLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join PicoCareer',
          text: 'Join me on PicoCareer and we both get 15 tokens!',
          url: referralLink,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (codeLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Referral Link */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share your unique link with friends. When they sign up, you both get 15 tokens!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="bg-white"
                />
                <Button onClick={copyToClipboard} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button onClick={shareReferralLink} className="bg-purple-600 hover:bg-purple-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Your referral code: <span className="font-mono font-bold">{referralCode}</span>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Loading your referral link...</div>
          )}
        </CardContent>
      </Card>

      {/* Referral Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                People Referred
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalReferrals}</div>
              <p className="text-sm text-muted-foreground">friends joined through your link</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5" />
                Tokens Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalTokensEarned}</div>
              <p className="text-sm text-muted-foreground">tokens from referrals</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Referrals */}
      {stats?.recentReferrals && stats.recentReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>Your latest successful referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentReferrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {referral.referred?.first_name} {referral.referred?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(referral.registration_completed_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-green-600 font-medium">+15 tokens</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-600">
              <div>
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                <p>Share your unique referral link with friends</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                <p>When they sign up using your link, they get 15 welcome tokens</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                <p>You automatically earn 15 tokens for each successful referral!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

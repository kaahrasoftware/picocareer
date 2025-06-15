
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Users, Gift, RefreshCw, Share2 } from "lucide-react";
import { useReferralCode } from "@/hooks/useReferralCode";
import { useReferralStats } from "@/hooks/useReferralStats";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function ReferralsTab() {
  const { referralCode, isLoading: codeLoading, regenerateCode, getReferralLink } = useReferralCode();
  const { stats, isLoading: statsLoading } = useReferralStats();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareReferralLink = async () => {
    const link = getReferralLink();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join PicoCareer with my referral link!',
          text: 'Hey! Join PicoCareer and get started on your career journey. Use my referral link to get started!',
          url: link
        });
      } catch (error) {
        copyToClipboard(link);
      }
    } else {
      copyToClipboard(link);
    }
  };

  if (codeLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const referralLink = getReferralLink();

  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link with friends and family to earn 15 tokens for each successful signup!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralLink)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={shareReferralLink}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button
              variant="outline"
              onClick={() => regenerateCode.mutate()}
              disabled={regenerateCode.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerateCode.isPending ? 'animate-spin' : ''}`} />
              New Code
            </Button>
          </div>

          {referralCode && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Your referral code:</p>
              <p className="font-mono font-semibold text-lg">{referralCode.referral_code}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Friends who joined using your link
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Earned</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTokensEarned || 0}</div>
            <p className="text-xs text-muted-foreground">
              From successful referrals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>
            Your latest successful referrals and rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentReferrals?.length ? (
            <div className="space-y-4">
              {stats.recentReferrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={referral.referred?.avatar_url} />
                      <AvatarFallback>
                        {referral.referred?.first_name?.[0]}{referral.referred?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {referral.referred?.first_name} {referral.referred?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDistanceToNow(new Date(referral.registration_completed_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    +15 tokens
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No referrals yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share your referral link with friends to start earning tokens!
              </p>
              <Button
                onClick={shareReferralLink}
                size="sm"
              >
                Share Now
              </Button>
            </div>
          )}
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
                <p>Share your unique referral link with friends and family</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                <p>They sign up using your link and complete registration</p>
              </div>
              <div>
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                <p>You earn 15 tokens automatically for each successful referral!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

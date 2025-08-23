import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, Trophy, Star, Clock, Users, Tag, ArrowRight, Zap } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const Prizes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Prizes & Promotions - PicoCareer";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover amazing prizes and promotional offers at PicoCareer. Earn tokens, unlock rewards, and access exclusive opportunities.');
    }
  }, []);

  // Building Bridges event data
  const buildingBridgesEvent = {
    id: "building-bridges-2025",
    title: "Building Bridges",
    subtitle: "PicoCareer Prize Giveaway!",
    description: "Unlock this incredible package designed to kickstart your future",
    prizes: [
      "🎁 $100 worth of Pico Tokens (100% free!)",
      "🎓 40 free mentorship sessions with any of our 20+ mentors", 
      "📝 Expert guidance on college applications, scholarships, financial aid, and study abroad programs",
      "💡 Career advice and mentorship to help shape your future",
      "🤖 Free AI-powered career assessment to discover your strengths and best-fit career paths"
    ],
    bonuses: [
      "✨ Invite 5 friends, each one gets 50% off in our Token Shop",
      "🏫 Invite your school, and your entire school community can enjoy 50% off in our Token Shop"
    ],
    claimInstructions: {
      winner: "Create an account → Check your wallet → Click Token Shop → Purchase 1000 Tokens → Enter coupon BRIDGES2025",
      friends: ["FRIEND1", "FRIEND2", "FRIEND3", "FRIEND4", "FRIEND5"],
      school: "Reach out to us at info@picocareer.com with the subject line 'Pico Hub - Building Bridges'"
    }
  };

  const handleClaimWinnerPrize = () => {
    navigate('/token-shop?discount=BRIDGES2025');
  };

  const handleFriendCoupon = (coupon: string) => {
    navigate(`/token-shop?discount=${coupon}`);
  };

  const handleSchoolInquiry = () => {
    window.open('mailto:info@picocareer.com?subject=Pico Hub - Building Bridges', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {buildingBridgesEvent.title}
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-primary mb-4">{buildingBridgesEvent.subtitle}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {buildingBridgesEvent.description}
          </p>
        </header>

        {/* Building Bridges Prize Section */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <Badge className="bg-primary text-primary-foreground animate-pulse">
                  <Star className="h-3 w-3 mr-1" />
                  Exclusive Giveaway
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold text-center mb-2">
                What You'll Win
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Prize Items */}
              <div className="grid md:grid-cols-2 gap-4">
                {buildingBridgesEvent.prizes.map((prize, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                    <span className="text-sm font-medium">{prize}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Bonus Section */}
              <div>
                <h4 className="font-semibold text-lg mb-3 text-center">Plus These Amazing Bonuses!</h4>
                <div className="space-y-3">
                  {buildingBridgesEvent.bonuses.map((bonus, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                      <span className="text-sm font-medium">{bonus}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* How to Claim Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">How to Claim Your Prizes</h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Winner Instructions */}
            <Card className="relative bg-gradient-to-br from-background to-primary/5 border-primary/20">
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-primary text-primary-foreground">
                  <Trophy className="h-3 w-3 mr-1" />
                  Winner
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-center">🏆 If You're the Winner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground text-center mb-4">
                  {buildingBridgesEvent.claimInstructions.winner}
                </div>
                <Button 
                  onClick={handleClaimWinnerPrize}
                  className="w-full"
                  size="lg"
                >
                  Claim Winner Prize
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <div className="text-center">
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                    BRIDGES2025
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Friends Section */}
            <Card className="bg-gradient-to-br from-background to-secondary/5 border-secondary/20">
              <CardHeader>
                <CardTitle className="text-xl text-center">👥 Friends (50% Off)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Each friend gets their own discount code:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {buildingBridgesEvent.claimInstructions.friends.map((friendCode, index) => (
                    <Button
                      key={friendCode}
                      variant="outline"
                      size="sm"
                      onClick={() => handleFriendCoupon(friendCode)}
                      className="font-mono text-xs"
                    >
                      {friendCode}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Click any code to apply in Token Shop
                </p>
              </CardContent>
            </Card>

            {/* School Section */}
            <Card className="bg-gradient-to-br from-background to-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-xl text-center">🏫 School Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Get your entire school 50% off by contacting us:
                </p>
                <Button 
                  onClick={handleSchoolInquiry}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Contact Us
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Subject: "Pico Hub - Building Bridges"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Start Earning?</CardTitle>
              <CardDescription className="text-base">
                Visit the Token Shop to purchase tokens and start claiming these amazing prizes.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button asChild size="lg" className="px-8">
                <Link to="/token-shop">
                  Visit Token Shop
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Prizes;
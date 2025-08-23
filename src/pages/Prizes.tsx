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

  // Mock data for promotions
  const activePromotions = [
    {
      id: "1",
      title: "Welcome Bonus",
      description: "Get 50% extra tokens on your first purchase",
      discountCode: "WELCOME50",
      validUntil: "2025-01-31",
      tokenBonus: 50,
      isActive: true,
      featured: true
    },
    {
      id: "2", 
      title: "Student Special",
      description: "20% off all token packages for verified students",
      discountCode: "STUDENT20",
      validUntil: "2025-02-28",
      tokenBonus: 20,
      isActive: true,
      featured: false
    },
    {
      id: "3",
      title: "Holiday Deal",
      description: "Double tokens on packages over 500 tokens",
      discountCode: "HOLIDAY2X",
      validUntil: "2024-12-31",
      tokenBonus: 100,
      isActive: true,
      featured: true
    }
  ];

  // Mock data for prizes
  const availablePrizes = [
    {
      id: "1",
      name: "Career Coaching Session",
      description: "One-on-one career coaching with industry professionals", 
      tokenCost: 1000,
      category: "Professional Development",
      availability: "Limited",
      estimatedValue: "$150"
    },
    {
      id: "2",
      name: "Premium Resume Review",
      description: "Professional resume review and optimization by experts",
      tokenCost: 500,
      category: "Career Services", 
      availability: "Available",
      estimatedValue: "$75"
    },
    {
      id: "3",
      name: "LinkedIn Profile Optimization",
      description: "Complete LinkedIn profile makeover by career specialists",
      tokenCost: 750,
      category: "Professional Development",
      availability: "Available", 
      estimatedValue: "$100"
    },
    {
      id: "4",
      name: "Interview Prep Package",
      description: "Mock interviews and feedback sessions with industry mentors",
      tokenCost: 1200,
      category: "Career Services",
      availability: "Limited",
      estimatedValue: "$200"
    },
    {
      id: "5",
      name: "Networking Event Access",
      description: "VIP access to exclusive industry networking events",
      tokenCost: 800,
      category: "Networking",
      availability: "Available",
      estimatedValue: "$120"
    },
    {
      id: "6",
      name: "Skill Assessment Bundle",
      description: "Comprehensive skill assessments across multiple domains",
      tokenCost: 600,
      category: "Assessment",
      availability: "Available",
      estimatedValue: "$80"
    }
  ];

  const handleUsePromotion = (discountCode: string) => {
    navigate(`/token-shop?discount=${discountCode}`);
  };

  const handleClaimPrize = (prizeId: string) => {
    // Navigate to token shop or prize claim flow
    navigate('/token-shop');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Prizes & Promotions
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing rewards and exclusive offers. Earn tokens, unlock prizes, and boost your career journey.
          </p>
        </header>

        {/* Active Promotions Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Tag className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Active Promotions</h2>
            <Badge variant="secondary" className="animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              Limited Time
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePromotions.map((promotion) => (
              <Card 
                key={promotion.id} 
                className={`relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  promotion.featured ? 'ring-2 ring-primary/20 bg-gradient-to-br from-background to-primary/5' : ''
                }`}
              >
                {promotion.featured && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {promotion.title}
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      +{promotion.tokenBonus}%
                    </Badge>
                  </CardTitle>
                  <CardDescription>{promotion.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Promo Code:</span>
                      <code className="px-2 py-1 bg-muted rounded font-mono text-sm">
                        {promotion.discountCode}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Valid until {new Date(promotion.validUntil).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={() => handleUsePromotion(promotion.discountCode)}
                    className="w-full group"
                    variant={promotion.featured ? "default" : "outline"}
                  >
                    Use Promotion
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Prizes Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Available Prizes</h2>
            <Badge variant="secondary" className="ml-auto">
              <Users className="h-3 w-3 mr-1" />
              {availablePrizes.length} Available
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePrizes.map((prize) => (
              <Card key={prize.id} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{prize.name}</CardTitle>
                    <Badge 
                      variant={prize.availability === "Limited" ? "destructive" : "secondary"}
                      className="shrink-0"
                    >
                      {prize.availability}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{prize.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Token Cost:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-primary">{prize.tokenCost.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">tokens</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Est. Value:</span>
                      <span className="text-sm font-medium">{prize.estimatedValue}</span>
                    </div>
                    
                    <Badge variant="outline" className="w-fit">
                      {prize.category}
                    </Badge>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={() => handleClaimPrize(prize.id)}
                    className="w-full group"
                    variant="outline"
                    disabled={prize.availability === "Limited"}
                  >
                    {prize.availability === "Limited" ? "Currently Unavailable" : "Claim Prize"}
                    {prize.availability !== "Limited" && (
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
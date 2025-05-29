
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award, 
  Globe, 
  Lightbulb,
  Target,
  Heart
} from "lucide-react";

const benefits = [
  {
    icon: BookOpen,
    title: "Educational Impact",
    description: "Help shape curriculum and provide real-world insights to students",
    badges: ["Curriculum Development", "Guest Lectures", "Case Studies"]
  },
  {
    icon: Users,
    title: "Talent Pipeline",
    description: "Access to talented students and fresh graduates for internships and hiring",
    badges: ["Internship Programs", "Graduate Recruitment", "Skill Assessment"]
  },
  {
    icon: TrendingUp,
    title: "Brand Visibility",
    description: "Increase your organization's visibility among students and educators",
    badges: ["Brand Recognition", "Thought Leadership", "Marketing Opportunities"]
  },
  {
    icon: Award,
    title: "Recognition",
    description: "Be recognized as an industry leader committed to education and development",
    badges: ["Industry Awards", "Media Coverage", "Speaking Opportunities"]
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Connect with educational institutions and professionals worldwide",
    badges: ["International Partnerships", "Cross-Cultural Exchange", "Global Reach"]
  },
  {
    icon: Lightbulb,
    title: "Innovation Hub",
    description: "Collaborate on cutting-edge research and innovative solutions",
    badges: ["Research Projects", "Innovation Labs", "Technology Transfer"]
  },
  {
    icon: Target,
    title: "Strategic Alignment",
    description: "Align your CSR goals with meaningful educational impact",
    badges: ["CSR Objectives", "Social Impact", "Sustainability Goals"]
  },
  {
    icon: Heart,
    title: "Community Building",
    description: "Build lasting relationships within the education and career development community",
    badges: ["Networking Events", "Community Forums", "Mentorship Programs"]
  }
];

export function PartnershipBenefits() {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">Partnership Benefits</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the many ways partnering with PicoCareer can benefit your organization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => (
          <Card key={index} className="border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
              <div className="flex flex-wrap gap-1">
                {benefit.badges.map((badge, badgeIndex) => (
                  <Badge key={badgeIndex} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

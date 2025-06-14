
import { Gift, UserPlus, Calendar, Coffee, Users, GraduationCap, BookOpen, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TokenMethodCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  amount: string;
  type: 'earn' | 'use';
}

function TokenMethodCard({ icon: Icon, title, description, amount, type }: TokenMethodCardProps) {
  return (
    <Card className="group relative overflow-hidden backdrop-blur-lg bg-white/10 border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg backdrop-blur-sm ${
              type === 'earn' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
          </div>
          <Badge 
            variant="secondary" 
            className={`backdrop-blur-sm border-0 text-xs font-semibold ${
              type === 'earn'
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
            }`}
          >
            {amount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-white/70 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

export function EarnUseTokensTab() {
  const earnMethods = [
    {
      icon: Gift,
      title: "Daily Login",
      description: "Sign in every day to receive your daily token bonus. Consistency pays off!",
      amount: "5 tokens/day"
    },
    {
      icon: UserPlus,
      title: "Refer Friends",
      description: "Invite friends to join and earn tokens when they complete registration.",
      amount: "15 tokens/invite"
    },
    {
      icon: Calendar,
      title: "Attend Events",
      description: "Participate in webinars, workshops, and networking events to earn tokens.",
      amount: "25-100 tokens"
    },
    {
      icon: Coffee,
      title: "Coffee Chats",
      description: "Join informal coffee chat sessions with mentors and peers.",
      amount: "25-50 tokens"
    }
  ];

  const useMethods = [
    {
      icon: Users,
      title: "Mentorship Sessions",
      description: "Book one-on-one sessions with experienced mentors in your field.",
      amount: "50-200 tokens"
    },
    {
      icon: GraduationCap,
      title: "Premium Events",
      description: "Access exclusive webinars and workshops with industry experts.",
      amount: "25-100 tokens"
    },
    {
      icon: BookOpen,
      title: "Premium Content",
      description: "Unlock scholarships, opportunities, career guides, and university insights.",
      amount: "10-50 tokens"
    },
    {
      icon: Star,
      title: "Pico AI Assessments",
      description: "Access our advanced AI-powered career assessment and guidance tools.",
      amount: "30-75 tokens"
    }
  ];

  return (
    <div className="space-y-8 p-1">
      {/* How to Earn Tokens */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
            How to Earn Tokens
          </h3>
          <p className="text-sm text-muted-foreground">
            Build your token balance through daily activities and engagement
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earnMethods.map((method, index) => (
            <TokenMethodCard
              key={index}
              icon={method.icon}
              title={method.title}
              description={method.description}
              amount={method.amount}
              type="earn"
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 py-2 text-muted-foreground backdrop-blur-sm rounded-full border border-white/10">
            Token Usage
          </span>
        </div>
      </div>

      {/* How to Use Tokens */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            How to Use Tokens
          </h3>
          <p className="text-sm text-muted-foreground">
            Invest your tokens in premium features and personalized guidance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useMethods.map((method, index) => (
            <TokenMethodCard
              key={index}
              icon={method.icon}
              title={method.title}
              description={method.description}
              amount={method.amount}
              type="use"
            />
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="backdrop-blur-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-center text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            💡 Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
            <div className="space-y-2">
              <p>• Log in daily to maximize your earnings</p>
              <p>• Attend multiple events for bonus rewards</p>
            </div>
            <div className="space-y-2">
              <p>• Share referral links on social media</p>
              <p>• Plan token spending for maximum value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

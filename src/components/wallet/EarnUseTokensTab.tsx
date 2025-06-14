
import { Gift, UserPlus, Calendar, Coffee, Users, GraduationCap, BookOpen, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TokenMethodCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  amount: string;
  type: 'earn' | 'use';
}

function TokenMethodCard({ icon: Icon, title, description, amount, type }: TokenMethodCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:from-white/20 hover:to-white/10 hover:shadow-xl hover:shadow-primary/10">
      <div className="flex items-start gap-4">
        <div className={`rounded-lg p-3 ${type === 'earn' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
          <Icon className="h-6 w-6" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Badge 
              variant="secondary" 
              className={`${type === 'earn' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'} backdrop-blur-sm`}
            >
              {amount}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

export function EarnUseTokensTab() {
  const earnMethods = [
    {
      icon: Gift,
      title: "Daily Login Bonus",
      description: "Sign in every day to receive your daily token reward. Consistency pays off!",
      amount: "5 tokens/day"
    },
    {
      icon: UserPlus,
      title: "Refer Friends",
      description: "Invite friends to join our platform and earn tokens when they complete registration.",
      amount: "15 tokens/invite"
    },
    {
      icon: Calendar,
      title: "Attend Webinars & Workshops",
      description: "Participate in educational events, webinars, and skill-building workshops.",
      amount: "25-100 tokens"
    },
    {
      icon: Coffee,
      title: "Coffee Chat Sessions",
      description: "Join casual networking sessions and community coffee chats.",
      amount: "25-50 tokens"
    }
  ];

  const useMethods = [
    {
      icon: Users,
      title: "Mentorship Sessions",
      description: "Book one-on-one mentorship sessions with industry professionals and experts.",
      amount: "50-200 tokens"
    },
    {
      icon: GraduationCap,
      title: "Premium Webinars & Workshops",
      description: "Access exclusive educational content, advanced workshops, and premium webinars.",
      amount: "25-150 tokens"
    },
    {
      icon: BookOpen,
      title: "Premium Content Access",
      description: "Unlock scholarships, opportunities, careers, majors, universities, and exclusive hubs.",
      amount: "10-100 tokens"
    },
    {
      icon: Star,
      title: "Pico AI Career Assessments",
      description: "Get personalized career recommendations and detailed analysis from our AI tool.",
      amount: "75 tokens"
    }
  ];

  return (
    <div className="space-y-8">
      {/* How to Earn Tokens Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">How to Earn Tokens</h2>
          <p className="text-muted-foreground">
            Build your token balance through daily activities and community engagement
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
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
          <div className="w-full border-t border-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground backdrop-blur-sm">
            Token Usage
          </span>
        </div>
      </div>

      {/* How to Use Tokens Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">How to Use Tokens</h2>
          <p className="text-muted-foreground">
            Unlock premium features and accelerate your career journey
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
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
      <div className="rounded-xl border border-white/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 backdrop-blur-md">
        <h3 className="mb-3 font-semibold text-foreground">💡 Pro Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
            Log in daily to maximize your token earnings through consistency bonuses
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
            Attend multiple events each month to build a substantial token balance
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
            Refer friends who are genuinely interested in career development
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
            Plan your token usage strategically for maximum career impact
          </li>
        </ul>
      </div>
    </div>
  );
}

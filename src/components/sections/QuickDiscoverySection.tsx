
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, 
  Users, 
  BookOpen, 
  TrendingUp, 
  ArrowRight, 
  GraduationCap,
  Briefcase,
  FileText,
  Calendar,
  Building,
  Coins,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickDiscoverySection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const quickActions = [
    {
      icon: Brain,
      title: "Career Assessment",
      description: "Discover your ideal career path with our AI-powered assessment",
      href: "/career-assessment",
      color: "bg-gradient-to-br from-[#00A6D4] to-[#0095c1]",
      bgColor: "bg-[#00A6D4]/5 hover:bg-[#00A6D4]/10 border-[#00A6D4]/10",
      textColor: "text-[#00A6D4]"
    },
    {
      icon: Users,
      title: "Find Mentors",
      description: "Connect with expert mentors in your field of interest",
      href: "/mentor",
      color: "bg-gradient-to-br from-[#33b3d9] to-[#00A6D4]",
      bgColor: "bg-[#33b3d9]/5 hover:bg-[#33b3d9]/10 border-[#33b3d9]/10",
      textColor: "text-[#33b3d9]"
    },
    {
      icon: BookOpen,
      title: "Explore Programs",
      description: "Browse academic programs and degree options",
      href: "/program",
      color: "bg-gradient-to-br from-[#0095c1] to-[#008bb5]",
      bgColor: "bg-[#0095c1]/5 hover:bg-[#0095c1]/10 border-[#0095c1]/10",
      textColor: "text-[#0095c1]"
    },
    {
      icon: TrendingUp,
      title: "Career Paths",
      description: "Explore different career opportunities and requirements",
      href: "/career",
      color: "bg-gradient-to-br from-[#66c2e0] to-[#33b3d9]",
      bgColor: "bg-[#66c2e0]/5 hover:bg-[#66c2e0]/10 border-[#66c2e0]/10",
      textColor: "text-[#66c2e0]"
    },
    {
      icon: GraduationCap,
      title: "Scholarships",
      description: "Browse scholarships and funding opportunities",
      href: "/scholarships",
      color: "bg-gradient-to-br from-[#4da6d9] to-[#0095c1]",
      bgColor: "bg-[#4da6d9]/5 hover:bg-[#4da6d9]/10 border-[#4da6d9]/10",
      textColor: "text-[#4da6d9]"
    },
    {
      icon: Briefcase,
      title: "Opportunities",
      description: "Explore internships and job opportunities",
      href: "/opportunities",
      color: "bg-gradient-to-br from-[#1aa3d1] to-[#0095c1]",
      bgColor: "bg-[#1aa3d1]/5 hover:bg-[#1aa3d1]/10 border-[#1aa3d1]/10",
      textColor: "text-[#1aa3d1]"
    },
    {
      icon: FileText,
      title: "Resource Bank",
      description: "Access educational resources and materials",
      href: "/resource-bank",
      color: "bg-gradient-to-br from-[#5cb3dc] to-[#33b3d9]",
      bgColor: "bg-[#5cb3dc]/5 hover:bg-[#5cb3dc]/10 border-[#5cb3dc]/10",
      textColor: "text-[#5cb3dc]"
    },
    {
      icon: Calendar,
      title: "Events",
      description: "Discover upcoming events and workshops",
      href: "/events",
      color: "bg-gradient-to-br from-[#29a8d4] to-[#0095c1]",
      bgColor: "bg-[#29a8d4]/5 hover:bg-[#29a8d4]/10 border-[#29a8d4]/10",
      textColor: "text-[#29a8d4]"
    },
    {
      icon: Building,
      title: "Hubs",
      description: "Join community hubs and discussion groups",
      href: "/hubs",
      color: "bg-gradient-to-br from-[#3db0d6] to-[#00A6D4]",
      bgColor: "bg-[#3db0d6]/5 hover:bg-[#3db0d6]/10 border-[#3db0d6]/10",
      textColor: "text-[#3db0d6]"
    },
    {
      icon: FileText,
      title: "Blogs",
      description: "Read latest articles and insights",
      href: "/blog",
      color: "bg-gradient-to-br from-[#52b5de] to-[#33b3d9]",
      bgColor: "bg-[#52b5de]/5 hover:bg-[#52b5de]/10 border-[#52b5de]/10",
      textColor: "text-[#52b5de]"
    },
    {
      icon: Coins,
      title: "Token Shop",
      description: "Purchase tokens for premium features",
      href: "/token-shop",
      color: "bg-gradient-to-br from-[#47b2dd] to-[#00A6D4]",
      bgColor: "bg-[#47b2dd]/5 hover:bg-[#47b2dd]/10 border-[#47b2dd]/10",
      textColor: "text-[#47b2dd]"
    }
  ];

  // Duplicate the actions for seamless infinite scrolling
  const duplicatedActions = [...quickActions, ...quickActions];

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cardWidth = 320; // w-80 = 320px
    const gap = 24; // space-x-6 = 24px
    const scrollDistance = cardWidth + gap;

    // Pause animation during manual scroll
    setIsPaused(true);

    if (direction === 'left') {
      container.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollDistance, behavior: 'smooth' });
    }

    // Resume animation after scroll completes
    setTimeout(() => {
      setIsPaused(false);
    }, 500);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-[#00A6D4]/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Discovery</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Jump-start your journey with our most popular tools and resources
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md"
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Scrolling Container */}
          <div className="overflow-hidden">
            <div 
              ref={scrollContainerRef}
              className={`flex space-x-6 ${isPaused ? '' : 'animate-scroll-horizontal'} overflow-x-auto scrollbar-hide`}
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitScrollbar: { display: 'none' }
              }}
            >
              {duplicatedActions.map((action, index) => (
                <Card 
                  key={index} 
                  className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden h-full flex-shrink-0 w-80"
                >
                  <CardContent className={`p-6 h-full ${action.bgColor} transition-colors border`}>
                    <div className="flex flex-col items-center text-center space-y-4 h-full">
                      <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="space-y-2 flex-grow">
                        <h3 className={`font-semibold text-lg ${action.textColor}`}>
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                      
                      <Button 
                        asChild 
                        variant="ghost" 
                        className={`${action.textColor} hover:bg-white/50 group-hover:translate-x-1 transition-all duration-300 mt-auto`}
                      >
                        <Link to={action.href} className="flex items-center gap-2">
                          Get Started
                          <ArrowRight className="w-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

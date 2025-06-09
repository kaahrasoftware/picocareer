
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentorStats } from "@/hooks/useMentorStats";
import { Heart, Users, Star, Target, Award, Lightbulb, GraduationCap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const MentorTabsSection = () => {
  const { data: stats, isLoading } = useMentorStats();
  const [activeTab, setActiveTab] = useState("benefits");

  const mentorBenefits = [
    {
      icon: Heart,
      title: "Make Impact",
      description: "Guide students toward successful careers",
      gradient: "from-red-400 to-pink-400",
      iconBg: "bg-red-50",
      iconColor: "text-red-500"
    },
    {
      icon: Users,
      title: "Expand Network",
      description: "Connect with passionate students",
      gradient: "from-blue-400 to-cyan-400",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      icon: Star,
      title: "Develop Skills",
      description: "Enhance your leadership abilities",
      gradient: "from-yellow-400 to-orange-400",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      icon: Target,
      title: "Flexible Schedule",
      description: "Mentor on your own time",
      gradient: "from-green-400 to-emerald-400",
      iconBg: "bg-green-50",
      iconColor: "text-green-500"
    },
    {
      icon: Award,
      title: "Recognition",
      description: "Build your reputation as a leader",
      gradient: "from-purple-400 to-indigo-400",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500"
    },
    {
      icon: Lightbulb,
      title: "Share Expertise",
      description: "Help others learn from your experience",
      gradient: "from-amber-400 to-yellow-400",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600"
    }
  ];

  const processSteps = [
    {
      number: "1",
      title: "Complete Profile",
      description: "Share your expertise and experience",
      gradient: "from-blue-400 to-cyan-400",
      bgColor: "bg-blue-50"
    },
    {
      number: "2", 
      title: "Set Preferences",
      description: "Choose your availability and focus areas",
      gradient: "from-purple-400 to-pink-400",
      bgColor: "bg-purple-50"
    },
    {
      number: "3",
      title: "Start Mentoring",
      description: "Connect with students and make an impact",
      gradient: "from-green-400 to-emerald-400",
      bgColor: "bg-green-50"
    }
  ];

  const mentorStats = [
    { 
      number: isLoading ? "..." : `${stats?.satisfactionRate}%`, 
      label: "Satisfaction Rate",
      gradient: "from-emerald-400 to-cyan-400",
      iconBg: "bg-emerald-100",
      textColor: "text-emerald-600"
    },
    { 
      number: isLoading ? "..." : `${Math.floor((stats?.totalSessions || 0) / 1000)}K+`, 
      label: "Sessions Completed",
      gradient: "from-blue-400 to-purple-400", 
      iconBg: "bg-blue-100",
      textColor: "text-blue-600"
    },
    { 
      number: isLoading ? "..." : `${stats?.mentorCount}+`, 
      label: "Active Mentors",
      gradient: "from-purple-400 to-pink-400",
      iconBg: "bg-purple-100", 
      textColor: "text-purple-600"
    }
  ];

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,197,253,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(196,181,253,0.1),transparent_50%)]" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Join Our Mentor Community
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the benefits, see our impact, learn the process, and start your mentoring journey.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="benefits" className="text-sm">Benefits</TabsTrigger>
            <TabsTrigger value="impact" className="text-sm">Impact</TabsTrigger>
            <TabsTrigger value="process" className="text-sm">Process</TabsTrigger>
            <TabsTrigger value="join" className="text-sm">Join Now</TabsTrigger>
          </TabsList>

          <TabsContent value="benefits" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentorBenefits.map((benefit, index) => (
                <Card 
                  key={index} 
                  className="group border-border/50 hover:border-transparent hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient}`} />
                  
                  <CardContent className="p-4 relative z-10">
                    <div className={`${benefit.iconBg} p-3 rounded-lg w-fit mb-3 transition-colors duration-300`}>
                      <benefit.icon className={`h-5 w-5 ${benefit.iconColor} transform group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm group-hover:text-primary transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="impact" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="text-center border-0 shadow-lg">
                    <CardContent className="p-6">
                      <Skeleton className="h-10 w-16 mx-auto mb-3" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mentorStats.map((stat, index) => (
                  <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
                    <div className={`h-2 bg-gradient-to-r ${stat.gradient}`} />
                    <CardContent className="p-6 relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.iconBg} mb-3 relative z-10`}>
                        <div className={`text-2xl font-bold ${stat.textColor}`}>
                          {stat.number.charAt(0)}
                        </div>
                      </div>
                      <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                        {stat.number}
                      </div>
                      <div className="text-muted-foreground font-medium text-sm">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="process" className="mt-0">
            <div className="grid md:grid-cols-3 gap-6">
              {processSteps.map((step, index) => (
                <Card key={index} className="text-center group border-border/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <CardContent className="p-6 relative z-10">
                    <div className={`bg-gradient-to-r ${step.gradient} w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                      {step.number}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="join" className="mt-0">
            <Card className="relative overflow-hidden border-0 shadow-xl">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-picocareer-dark via-primary to-picocareer-primary opacity-90" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_50%)]" />
              
              {/* Floating Elements */}
              <div className="absolute top-6 left-6 w-16 h-16 bg-white/10 rounded-full animate-pulse" />
              <div className="absolute bottom-6 right-6 w-12 h-12 bg-white/5 rounded-full animate-pulse delay-1000" />
              
              <CardContent className="p-8 relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                  <span className="text-yellow-300 font-medium text-sm uppercase tracking-wide">
                    Start Your Journey
                  </span>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse delay-300" />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Make a Difference?
                </h3>
                <p className="text-xl text-white/90 mb-6 leading-relaxed">
                  Join {isLoading ? "hundreds" : `${stats?.mentorCount}+`} professionals mentoring the next generation.
                </p>
                
                {/* Stats Bar */}
                {!isLoading && stats && (
                  <div className="flex flex-wrap justify-center gap-4 mb-6 text-white/80 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                      <span>{stats.satisfactionRate}% satisfaction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-200" />
                      <span>{Math.floor(stats.totalSessions / 1000)}K+ sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-400" />
                      <span>{stats.averageRating}⭐ rating</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="bg-white hover:bg-gray-100 text-picocareer-dark font-semibold py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    <Link to="/mentor-registration" className="flex items-center justify-center gap-2">
                      <GraduationCap className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      Start Mentoring
                    </Link>
                  </Button>
                  
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 font-semibold py-3 px-6 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Link to="/mentors" className="flex items-center justify-center gap-2">
                      <Users className="h-5 w-5" />
                      Meet Mentors
                    </Link>
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-white/70 text-sm flex items-center justify-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-green-300 rounded-full" />
                      Free to join
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-blue-300 rounded-full" />
                      Flexible commitment
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-purple-300 rounded-full" />
                      Meaningful impact
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

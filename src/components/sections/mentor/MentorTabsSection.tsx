import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentorStats } from "@/hooks/useMentorStats";
import { Heart, Users, Star, Target, Award, Lightbulb, GraduationCap, Sparkles, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function MentorTabsSection(/* ...props */) {
  const { data: stats, isLoading } = useMentorStats();
  const [activeTab, setActiveTab] = useState("join");

  // Utility function to format numbers appropriately
  const formatNumber = (number: number): string => {
    if (number < 1000) {
      return number.toString();
    } else {
      return (number / 1000).toFixed(1) + "K+";
    }
  };

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

  // Calculate total mentoring hours (assuming 1 hour average per session)
  const totalHours = Math.floor((stats?.totalSessions || 0) * 1);

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
            Start your mentoring journey, discover the benefits, and learn the process.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="join" className="text-sm">Join Now</TabsTrigger>
            <TabsTrigger value="benefits" className="text-sm">Benefits</TabsTrigger>
            <TabsTrigger value="process" className="text-sm">Process</TabsTrigger>
          </TabsList>

          <TabsContent value="join" className="mt-0">
            {/* Enhanced Stats Cards */}
            {!isLoading && stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group bg-gradient-to-br from-emerald-50 to-cyan-50">
                  <div className="h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                  <CardContent className="p-6 relative">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                      {stats.satisfactionRate}%
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">Student Satisfaction</div>
                    <div className="text-xs text-emerald-600 mt-1 font-medium">Above Industry Average</div>
                  </CardContent>
                </Card>

                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-400" />
                  <CardContent className="p-6 relative">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                      {formatNumber(stats.totalSessions)}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">Sessions Completed</div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">{totalHours}+ Hours of Guidance</div>
                  </CardContent>
                </Card>

                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400" />
                  <CardContent className="p-6 relative">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                      {formatNumber(stats.mentorCount)}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">Expert Mentors</div>
                    <div className="text-xs text-purple-600 mt-1 font-medium">From Top Companies</div>
                  </CardContent>
                </Card>

                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group bg-gradient-to-br from-yellow-50 to-orange-50">
                  <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-400" />
                  <CardContent className="p-6 relative">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
                      {stats.averageRating}⭐
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">Average Rating</div>
                    <div className="text-xs text-yellow-600 mt-1 font-medium">Highly Rated Experience</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Loading State for Stats */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, index) => (
                  <Card key={index} className="text-center border-0 shadow-lg">
                    <CardContent className="p-6">
                      <Skeleton className="h-12 w-12 rounded-full mx-auto mb-3" />
                      <Skeleton className="h-8 w-16 mx-auto mb-1" />
                      <Skeleton className="h-4 w-24 mx-auto mb-1" />
                      <Skeleton className="h-3 w-20 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Main CTA Card */}
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
                <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
                  Join {isLoading ? "hundreds" : `${formatNumber(stats?.mentorCount || 0)}`} professionals mentoring the next generation. 
                  Start sharing your expertise and help shape future careers.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="bg-white hover:bg-gray-100 text-picocareer-dark font-semibold py-4 px-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    <Link to="/mentor-registration" className="flex items-center justify-center gap-2">
                      <GraduationCap className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      Start Mentoring Today
                    </Link>
                  </Button>
                  
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="
                      w-full sm:w-auto
                      bg-gradient-to-r from-blue-500 via-green-400 to-blue-600
                      text-white font-bold text-lg py-6 px-8
                      shadow-xl hover:shadow-2xl
                      hover:scale-105 transition-all duration-300
                      relative overflow-hidden
                      border-none
                      focus:ring-4 focus:ring-blue-300
                      group
                    "
                  >
                    <Link to="/mentor" className="flex items-center justify-center gap-3 focus:outline-none">
                      <span className="relative flex items-center">
                        <Users
                          className="h-6 w-6 drop-shadow-md animate-pulse"
                          style={{
                            filter: "drop-shadow(0 0 8px rgba(34,197,94,0.85))"
                          }}
                        />
                      </span>
                      <span>
                        Meet Our Mentors
                      </span>
                    </Link>
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-white/70 text-sm flex items-center justify-center gap-6 flex-wrap">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                      Free to join
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-200" />
                      Flexible commitment
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-400" />
                      Meaningful impact
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse delay-600" />
                      Build your reputation
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
        </Tabs>
      </div>
    </section>
  );
};

export default MentorTabsSection;

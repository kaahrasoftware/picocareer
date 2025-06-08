
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Star, Heart, Target, Award, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

export const CallToActionSection = () => {
  const { session } = useAuthSession();

  const mentorBenefits = [
    {
      icon: Heart,
      title: "Make a Lasting Impact",
      description: "Guide students toward successful careers and personal growth"
    },
    {
      icon: Users,
      title: "Expand Your Network",
      description: "Connect with passionate students and fellow professionals"
    },
    {
      icon: Star,
      title: "Develop Leadership Skills",
      description: "Enhance your communication and mentoring abilities"
    },
    {
      icon: Target,
      title: "Flexible Scheduling",
      description: "Mentor on your own time with scheduling that works for you"
    },
    {
      icon: Award,
      title: "Recognition & Growth",
      description: "Build your reputation as a thought leader in your field"
    },
    {
      icon: Lightbulb,
      title: "Share Your Expertise",
      description: "Help others learn from your professional experiences"
    }
  ];

  const mentorStats = [
    { number: "95%", label: "Student Satisfaction Rate" },
    { number: "2K+", label: "Successful Mentoring Sessions" },
    { number: "500+", label: "Active Mentors" }
  ];

  return (
    <section className="py-16 relative overflow-hidden rounded-xl mx-4">
      <div className="absolute inset-0 bg-gradient-to-r from-picocareer-dark to-picocareer-primary opacity-90" />
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Become a Mentor, Transform Lives
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Share your expertise and help students navigate their academic and career journeys. 
            Join our community of dedicated professionals making a real difference.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          
          {/* Left Column - Benefits */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">
                Why Become a Mentor?
              </h3>
              <div className="grid gap-4">
                {mentorBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                      <p className="text-white/80 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - CTA and Stats */}
          <div className="space-y-8">
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-4">
              {mentorStats.map((stat, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-xs text-white/80">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action Buttons */}
            <div className="space-y-4">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full bg-white hover:bg-gray-100 text-picocareer-dark font-semibold text-lg py-6"
              >
                <Link to="/mentor-registration" className="flex items-center justify-center gap-3">
                  <GraduationCap className="h-6 w-6" />
                  Start Your Mentoring Journey
                </Link>
              </Button>
              
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10 font-semibold text-lg py-6"
              >
                <Link to="/mentors" className="flex items-center justify-center gap-3">
                  <Users className="h-6 w-6" />
                  Meet Our Mentors
                </Link>
              </Button>
            </div>

            {/* Quick Process Steps */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h4 className="font-semibold text-white mb-4">Simple 3-Step Process:</h4>
              <div className="space-y-3 text-sm text-white/90">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Complete your mentor profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Set your availability and expertise areas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Start connecting with motivated students</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <p className="text-white/90 mb-4">
            Ready to make a difference? Join hundreds of professionals already mentoring the next generation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white hover:bg-gray-100 text-picocareer-dark font-semibold"
            >
              <Link to="/mentor-registration">
                Get Started Today
              </Link>
            </Button>
            <span className="text-white/70 text-sm">
              • Free to join • Flexible commitment • Meaningful impact
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

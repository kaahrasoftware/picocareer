
import { Heart, Users, Star, Target, Award, Lightbulb } from "lucide-react";

export const MentorBenefitsSection = () => {
  const mentorBenefits = [
    {
      icon: Heart,
      title: "Make a Lasting Impact",
      description: "Guide students toward successful careers and personal growth",
      gradient: "from-red-400 to-pink-400",
      iconBg: "bg-red-50 group-hover:bg-red-100",
      iconColor: "text-red-500"
    },
    {
      icon: Users,
      title: "Expand Your Network",
      description: "Connect with passionate students and fellow professionals",
      gradient: "from-blue-400 to-cyan-400",
      iconBg: "bg-blue-50 group-hover:bg-blue-100",
      iconColor: "text-blue-500"
    },
    {
      icon: Star,
      title: "Develop Leadership Skills",
      description: "Enhance your communication and mentoring abilities",
      gradient: "from-yellow-400 to-orange-400",
      iconBg: "bg-yellow-50 group-hover:bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      icon: Target,
      title: "Flexible Scheduling",
      description: "Mentor on your own time with scheduling that works for you",
      gradient: "from-green-400 to-emerald-400",
      iconBg: "bg-green-50 group-hover:bg-green-100",
      iconColor: "text-green-500"
    },
    {
      icon: Award,
      title: "Recognition & Growth",
      description: "Build your reputation as a thought leader in your field",
      gradient: "from-purple-400 to-indigo-400",
      iconBg: "bg-purple-50 group-hover:bg-purple-100",
      iconColor: "text-purple-500"
    },
    {
      icon: Lightbulb,
      title: "Share Your Expertise",
      description: "Help others learn from your professional experiences",
      gradient: "from-amber-400 to-yellow-400",
      iconBg: "bg-amber-50 group-hover:bg-amber-100",
      iconColor: "text-amber-600"
    }
  ];

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,197,253,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(196,181,253,0.1),transparent_50%)]" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Become a Mentor?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join our community of dedicated professionals making a real difference in students' lives.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {mentorBenefits.map((benefit, index) => (
            <div 
              key={index} 
              className="group bg-card rounded-xl p-6 border border-border/50 hover:border-transparent hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Hover gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Top gradient line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              
              <div className="relative z-10">
                <div className={`${benefit.iconBg} p-4 rounded-xl w-fit mb-4 transition-colors duration-300 relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <benefit.icon className={`h-6 w-6 ${benefit.iconColor} relative z-10 transform group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

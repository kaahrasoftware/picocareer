
import { Heart, Users, Star, Target, Award, Lightbulb } from "lucide-react";

export const MentorBenefitsSection = () => {
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

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
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
            <div key={index} className="bg-card rounded-lg p-6 border hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

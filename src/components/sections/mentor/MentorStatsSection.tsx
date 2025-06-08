
import { Card, CardContent } from "@/components/ui/card";

export const MentorStatsSection = () => {
  const mentorStats = [
    { number: "95%", label: "Student Satisfaction Rate" },
    { number: "2K+", label: "Successful Mentoring Sessions" },
    { number: "500+", label: "Active Mentors" }
  ];

  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Mentoring Impact at PicoCareer
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our mentors are making a real difference in students' academic and career journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {mentorStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-8">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

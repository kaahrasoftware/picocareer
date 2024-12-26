import { Target, Flag, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  const teamMembers = [
    {
      name: "John Smith",
      role: "CEO & Founder",
      bio: "Passionate about connecting students with their dream careers."
    },
    {
      name: "Sarah Johnson",
      role: "Head of Mentorship",
      bio: "Dedicated to building bridges between industry experts and aspiring professionals."
    },
    {
      name: "Michael Chen",
      role: "Technical Lead",
      bio: "Focused on creating innovative solutions for career development."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold text-center mb-12">About PicoCareer</h1>
      
      <div className="grid gap-8 mb-16">
        {/* Mission Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Target className="w-8 h-8 text-picocareer-primary" />
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              To empower students and young professionals by providing comprehensive career guidance,
              mentorship opportunities, and educational resources that bridge the gap between academic
              learning and professional success.
            </p>
          </CardContent>
        </Card>

        {/* Vision Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Flag className="w-8 h-8 text-picocareer-primary" />
            <CardTitle>Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              To become the world's leading platform for career development and professional growth,
              where every individual can discover their potential and chart their path to success
              through personalized guidance and expert mentorship.
            </p>
          </CardContent>
        </Card>

        {/* Team Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <Users className="w-8 h-8 text-picocareer-primary" />
            <h2 className="text-2xl font-bold">Our Team</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <p className="text-sm text-picocareer-primary font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
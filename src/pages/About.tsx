import { Target, Flag, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  const teamMembers = [
    {
      name: "Rafik Tarbari",
      role: "CEO & Founder",
      bio: "Passionate about connecting students with their dream careers.",
      imageUrl: "/lovable-uploads/c4ff4218-d3ed-4e2e-a686-827b3c349576.png"
    },
    {
      name: "Dr. Francis Kangure",
      role: (
        <span className="flex items-center justify-center gap-2">
          National Director, Kenya
          <img 
            src="/lovable-uploads/b1e313c9-c9f3-4dbd-84b9-1ffc660e1103.png" 
            alt="Kenyan Flag"
            className="w-5 h-3 inline-block object-cover"
          />
        </span>
      ),
      bio: "Dedicated to building bridges between industry experts and aspiring professionals.",
      imageUrl: "/placeholder.svg"
    },
    {
      name: "Tav Denkey Jr.",
      role: "Mentor and Advisor | Founder and CEO MiaPay",
      imageUrl: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-picocareer-dark to-picocareer-primary opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 px-4">
            <h1 className="text-5xl font-bold">About PicoCareer</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Empowering the next generation of professionals through guidance and mentorship
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid gap-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Section */}
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-picocareer-primary to-picocareer-accent opacity-90 flex items-center justify-center">
                <Target className="w-16 h-16 text-white" />
              </div>
              <CardHeader className="flex flex-row items-center gap-4">
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
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-picocareer-secondary to-picocareer-dark opacity-90 flex items-center justify-center">
                <Flag className="w-16 h-16 text-white" />
              </div>
              <CardHeader className="flex flex-row items-center gap-4">
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
          </div>

          <section className="pt-12">
            <Card className="bg-gradient-to-br from-picocareer-dark to-picocareer-darker text-white">
              <CardContent className="p-8">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold mb-6">Our Values</h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                        <Target className="w-8 h-8" />
                      </div>
                      <h3 className="font-semibold mb-2">Excellence</h3>
                      <p className="text-white/80">Striving for the highest quality in everything we do</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                        <Users className="w-8 h-8" />
                      </div>
                      <h3 className="font-semibold mb-2">Community</h3>
                      <p className="text-white/80">Building strong relationships and fostering collaboration</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                        <Flag className="w-8 h-8" />
                      </div>
                      <h3 className="font-semibold mb-2">Innovation</h3>
                      <p className="text-white/80">Continuously improving and adapting to change</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Team Section */}
          <section className="pt-12">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Users className="w-8 h-8 text-picocareer-primary" />
                <h2 className="text-3xl font-bold">Our Team</h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet the passionate individuals dedicated to transforming career development and mentorship
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="transform transition-transform hover:scale-105">
                  <CardHeader className="text-center pb-4">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-picocareer-primary to-picocareer-accent p-1">
                      <img 
                        src={member.imageUrl} 
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover bg-white"
                      />
                    </div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <p className="text-sm text-picocareer-primary font-medium">{member.role}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

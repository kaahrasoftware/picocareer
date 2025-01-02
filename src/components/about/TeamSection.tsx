import { Users, Linkedin, Twitter } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamSection() {
  const teamMembers = [
    {
      name: "Rafik Tarbari",
      role: "CEO & Founder",
      imageUrl: "/lovable-uploads/c4ff4218-d3ed-4e2e-a686-827b3c349576.png",
      linkedin: "https://www.linkedin.com/in/rafik-tarbari",
      twitter: "https://x.com/rafiktarbari"
    },
    {
      name: "Tav Denkey Jr.",
      role: "Mentor | Founder & CEO of MiaPay",
      imageUrl: "/lovable-uploads/2f2ac4ac-1001-45b8-a930-df7c2414eaeb.png",
      linkedin: "https://www.linkedin.com/in/tavdenkeyjr",
      twitter: "https://x.com/tavdenkeyjr"
    }
  ];

  return (
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
              <div className="flex justify-center gap-4 mt-4">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-picocareer-primary transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {member.twitter && (
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-picocareer-primary transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
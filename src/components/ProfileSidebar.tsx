import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PieChart } from "recharts";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { MapPin, User } from "lucide-react";

const userProfile = {
  name: "John Doe",
  username: "@johndoe",
  location: "Austin, TX, USA",
  university: "NC State University",
  major: "Bio-Chemical Engineering",
  stats: {
    mentees: 0,
    connected: 495,
    recordings: 35,
  },
  tags: ["biochemical engineering", "microbiology"],
};

const careerConsiderations = [
  { name: "Bioprocess Eng.", value: 98 },
  { name: "Pharmaceutical Eng.", value: 89 },
  { name: "Biomedical Eng.", value: 81 },
];

export function ProfileSidebar() {
  return (
    <Sidebar side="right" variant="floating">
      <SidebarContent>
        {/* Profile Header */}
        <SidebarGroup>
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">{userProfile.major}</h2>
            <p className="text-sm text-muted-foreground mb-6">{userProfile.university}</p>
            
            <div className="relative mx-auto w-24 h-24 mb-4">
              <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 right-0 bg-primary rounded-full p-1">
                <User className="w-4 h-4" />
              </div>
            </div>

            <h3 className="text-lg font-medium">{userProfile.name}</h3>
            <p className="text-sm text-muted-foreground">{userProfile.username}</p>
            <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{userProfile.location}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 px-6 py-4 border-t border-b border-border">
            <div className="text-center">
              <p className="text-2xl font-semibold">{userProfile.stats.mentees}</p>
              <p className="text-xs text-muted-foreground">Mentees</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{userProfile.stats.connected}</p>
              <p className="text-xs text-muted-foreground">K-onnected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{userProfile.stats.recordings}</p>
              <p className="text-xs text-muted-foreground">Recordings</p>
            </div>
          </div>

          {/* Tags */}
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {userProfile.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-primary/10">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </SidebarGroup>

        {/* Career Considerations */}
        <SidebarGroup>
          <SidebarGroupLabel>Career Considerations</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-4">
              <div className="space-y-4">
                {careerConsiderations.map((career) => (
                  <div key={career.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{career.name}</span>
                      <span>{career.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${career.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
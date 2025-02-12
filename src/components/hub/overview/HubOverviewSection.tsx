
import { Hub } from "@/types/database/hubs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe, Link2, MapPin, Phone, Users } from "lucide-react";
import { HubSocialLinks } from "./HubSocialLinks";

interface HubOverviewSectionProps {
  hub: Hub;
  hubStats: {
    membersCount: number;
    resourcesCount: number;
  } | null;
}

export function HubOverviewSection({ hub, hubStats }: HubOverviewSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{hubStats?.membersCount || 0} Members</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{hubStats?.resourcesCount || 0} Resources</span>
            </div>
            {hub.contact_info?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{hub.contact_info.phone}</span>
              </div>
            )}
            {hub.contact_info?.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{hub.contact_info.address}</span>
              </div>
            )}
            {hub.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <a 
                  href={hub.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {hub.website}
                </a>
              </div>
            )}
            {hub.apply_now_URL && (
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-muted-foreground" />
                <a 
                  href={hub.apply_now_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Apply Now
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {hub.contact_info?.email && (
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-muted-foreground" />
                <a 
                  href={`mailto:${hub.contact_info.email}`}
                  className="text-primary hover:underline"
                >
                  {hub.contact_info.email}
                </a>
              </div>
            )}
            {hub.social_links && <HubSocialLinks socialLinks={hub.social_links} />}
          </div>
        </CardContent>
      </Card>

      {hub.important_links && hub.important_links.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Important Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {hub.important_links.map((link: { title: string; url: string }, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{link.title}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Globe, Users, FileText, Building, Link as LinkIcon, 
  Twitter, Facebook, Instagram, Linkedin, Youtube 
} from "lucide-react";
import { Hub } from "@/types/database/hubs";

interface HubOverviewSectionProps {
  hub: Hub;
  hubStats?: {
    membersCount: number;
    resourcesCount: number;
  } | null;
}

export function HubOverviewSection({ hub, hubStats }: HubOverviewSectionProps) {
  const navigate = useNavigate();

  // Array of social media links for mapping
  const socialLinks = [
    { icon: Twitter, url: hub.social_links?.twitter, label: "Twitter" },
    { icon: Facebook, url: hub.social_links?.facebook, label: "Facebook" },
    { icon: Instagram, url: hub.social_links?.instagram, label: "Instagram" },
    { icon: Linkedin, url: hub.social_links?.linkedin, label: "LinkedIn" },
    { icon: Youtube, url: hub.social_links?.youtube, label: "YouTube" },
  ].filter(link => link.url);  // Filter out empty links

  return (
    <div className="space-y-6">
      {/* Hub Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {hub.description || "No description available"}
          </p>
          
          {hub.apply_now_url && (
            <Button 
              className="mt-4" 
              onClick={() => window.open(hub.apply_now_url, '_blank')}
            >
              Apply Now
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Members</h3>
            </div>
            <p className="text-3xl font-bold mt-2">{hubStats?.membersCount || hub.current_member_count || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Resources</h3>
            </div>
            <p className="text-3xl font-bold mt-2">{hubStats?.resourcesCount || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Type</h3>
            </div>
            <p className="text-xl font-medium mt-2">{hub.type}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold">Website</h3>
            </div>
            {hub.website ? (
              <a 
                href={hub.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-2 block truncate"
              >
                {hub.website}
              </a>
            ) : (
              <p className="text-muted-foreground mt-2">Not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      {hub.contact_info && (Object.values(hub.contact_info).some(value => value)) && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hub.contact_info?.email && (
              <div>
                <span className="font-medium">Email: </span>
                <a href={`mailto:${hub.contact_info.email}`} className="text-blue-500 hover:underline">
                  {hub.contact_info.email}
                </a>
              </div>
            )}
            {hub.contact_info?.phone && (
              <div>
                <span className="font-medium">Phone: </span>
                <a href={`tel:${hub.contact_info.phone}`} className="text-blue-500 hover:underline">
                  {hub.contact_info.phone}
                </a>
              </div>
            )}
            {hub.contact_info?.address && (
              <div>
                <span className="font-medium">Address: </span>
                <span>{hub.contact_info.address}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <a 
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    title={item.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Links */}
      {hub.important_links && hub.important_links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Important Links</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {hub.important_links.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

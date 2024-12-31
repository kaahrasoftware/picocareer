import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Building2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface MentorCardProps {
  id: string;
  name: string;
  avatar_url: string | null;
  position?: string | null;
  company?: string | null;
  location?: string | null;
  skills?: string[];
  onClick?: () => void;
}

export function MentorCard(props: MentorCardProps) {
  return (
    <Card 
      className="relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      onClick={props.onClick}
    >
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          props.onClick?.();
        }}
        className="block p-6"
      >
        <div className="flex flex-col items-center text-center">
          <ProfileAvatar
            avatarUrl={props.avatar_url}
            fallback={props.name?.[0] || "?"}
            size="lg"
          />

          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {props.name}
            </h3>

            {props.position && (
              <p className="text-sm text-muted-foreground">
                {props.position}
              </p>
            )}

            {props.company && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{props.company}</span>
              </div>
            )}

            {props.location && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{props.location}</span>
              </div>
            )}
          </div>

          {/* Skills Section - Limited to 3 items with +X more */}
          {props.skills?.length > 0 && (
            <div className="w-full mb-4">
              <div className="flex flex-wrap gap-1.5">
                {props.skills.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {skill}
                  </Badge>
                ))}
                {props.skills.length > 3 && (
                  <Badge 
                    variant="outline"
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200"
                  >
                    +{props.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
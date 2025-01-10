import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MajorDetails } from "@/components/MajorDetails";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

interface SearchResultCardProps {
  result: SearchResult;
  type: "mentor" | "major" | "career";
}

export function SearchResultCard({ result, type }: SearchResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthSession();

  const handleViewDetails = () => {
    if (type === "mentor" && !session) {
      toast({
        title: "Authentication Required",
        description: "Join our community to connect with amazing mentors and unlock your career potential!",
        variant: "default",
        className: "bg-green-50 border-green-200",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/auth")}
            className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            Login
          </Button>
        ),
      });
      return;
    }
    setShowDetails(true);
  };

  switch (type) {
    case "mentor":
      return (
        <Card
          className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white h-full"
          onClick={handleViewDetails}
        >
          <div className="flex items-center gap-3 mb-3">
            <ProfileAvatar
              avatarUrl={result.avatar_url}
              fallback={result.title[0]}
              size="sm"
              editable={false}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1A1F2C] truncate">{result.title}</p>
              <div className="space-y-1">
                {result.subtitle && (
                  <p className="text-sm text-muted-foreground truncate">
                    {result.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {result.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {result.description}
            </p>
          )}

          {result.skills && result.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {result.skills.slice(0, 3).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                >
                  {skill}
                </Badge>
              ))}
              {result.skills.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                >
                  +{result.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </Card>
      );

    case "major":
      return (
        <>
          <Card
            className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white h-full"
            onClick={() => setShowDetails(true)}
          >
            <div className="flex items-center gap-3 mb-3">
              <ProfileAvatar
                avatarUrl={result.avatar_url}
                fallback={result.title[0]}
                size="sm"
                editable={false}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1A1F2C] truncate">{result.title}</p>
                <div className="space-y-1">
                  {result.subtitle && (
                    <p className="text-sm text-muted-foreground truncate">
                      {result.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {result.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {result.description}
              </p>
            )}

            {result.skills && result.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {result.skills.slice(0, 3).map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    {skill}
                  </Badge>
                ))}
                {result.skills.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    +{result.skills.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </Card>
          <MajorDetails
            majorId={result.id}
            open={showDetails}
            onOpenChange={setShowDetails}
          />
        </>
      );

    case "career":
      return (
        <>
          <Card
            className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white h-full"
            onClick={() => setShowDetails(true)}
          >
            <div className="flex items-center gap-3 mb-3">
              <ProfileAvatar
                avatarUrl={result.avatar_url}
                fallback={result.title[0]}
                size="sm"
                editable={false}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1A1F2C] truncate">{result.title}</p>
                <div className="space-y-1">
                  {result.subtitle && (
                    <p className="text-sm text-muted-foreground truncate">
                      {result.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {result.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {result.description}
              </p>
            )}

            {result.skills && result.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {result.skills.slice(0, 3).map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    {skill}
                  </Badge>
                ))}
                {result.skills.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    +{result.skills.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </Card>
          <CareerDetailsDialog
            careerId={result.id}
            open={showDetails}
            onOpenChange={setShowDetails}
          />
        </>
      );

    default:
      return null;
  }
}
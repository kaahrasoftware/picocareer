import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import type { MentorSearchResult } from "@/types/search";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

interface MentorSearchCardProps {
  result: MentorSearchResult;
  onClick?: (result: MentorSearchResult) => void;
}

export const MentorSearchCard = ({ result, onClick }: MentorSearchCardProps) => {
  const navigate = useNavigate();
  const { session } = useAuthSession();

  const handleClick = () => {
    if (onClick) {
      onClick(result);
      return;
    }

    if (!session) {
      toast.error("Authentication Required", {
        description: "Join our community to connect with amazing mentors!"
      });
      navigate("/auth");
      return;
    }
  };

  return (
    <Card
      className="flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white h-full"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <ProfileAvatar
          avatarUrl={result.avatar_url}
          size="sm"
          editable={false}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#1A1F2C] truncate">{result.title}</p>
          {result.career?.title && (
            <p className="text-sm text-[#8E9196] truncate">{result.career.title}</p>
          )}
        </div>
      </div>
      {result.keywords && result.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {result.keywords.slice(0, 3).map((keyword, index) => (
            <Badge 
              key={index}
              variant="secondary"
              className="bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
            >
              {keyword}
            </Badge>
          ))}
          {result.keywords.length > 3 && (
            <Badge 
              variant="secondary" 
              className="bg-[#FEF7CD] text-[#1A1F2C] hover:bg-[#F97316]/10"
            >
              +{result.keywords.length - 3}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
};
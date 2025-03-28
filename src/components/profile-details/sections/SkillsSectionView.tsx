
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/database/profiles";

interface SkillsSectionViewProps {
  profile: Profile;
}

export function SkillsSectionView({ profile }: SkillsSectionViewProps) {
  const hasSkills = 
    (profile.skills && profile.skills.length > 0) || 
    (profile.tools_used && profile.tools_used.length > 0) || 
    (profile.keywords && profile.keywords.length > 0) || 
    (profile.fields_of_interest && profile.fields_of_interest.length > 0);

  if (!hasSkills) {
    return (
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold mb-4">Skills & Expertise</h4>
        <p className="text-muted-foreground text-sm">No skills information provided yet.</p>
      </div>
    );
  }

  const renderTags = (items: string[] | null, bgColor: string, label: string) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium block">{label}</label>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge 
              key={`${item}-${index}`}
              className={`${bgColor} text-gray-700`}
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Skills & Expertise</h4>
      <div className="space-y-4">
        {renderTags(profile.skills, "bg-[#F2FCE2]", "Skills")}
        {renderTags(profile.tools_used, "bg-[#D3E4FD]", "Tools Used")}
        {renderTags(profile.keywords, "bg-[#FFDEE2]", "Keywords")}
        {renderTags(profile.fields_of_interest, "bg-[#E5DEFF]", "Fields of Interest")}
      </div>
    </div>
  );
}

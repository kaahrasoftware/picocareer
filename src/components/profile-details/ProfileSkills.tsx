import { Badge } from "@/components/ui/badge";
import { EditableField } from "@/components/profile/EditableField";

interface ProfileSkillsProps {
  skills: string[] | null;
  tools: string[] | null;
  keywords?: string[] | null;
  fieldsOfInterest?: string[] | null;
  profileId?: string;
}

export function ProfileSkills({ 
  skills, 
  tools, 
  keywords, 
  fieldsOfInterest,
  profileId 
}: ProfileSkillsProps) {
  if (!skills?.length && !tools?.length && !keywords?.length && !fieldsOfInterest?.length) return null;

  const formatArrayToString = (arr: string[] | null) => arr ? arr.join(", ") : "";

  return (
    <div className="bg-muted rounded-lg p-4 space-y-4">
      {profileId ? (
        <>
          <div>
            <h4 className="font-semibold mb-2">Skills</h4>
            <EditableField
              label="Skills"
              value={formatArrayToString(skills)}
              fieldName="skills"
              profileId={profileId}
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">Tools</h4>
            <EditableField
              label="Tools"
              value={formatArrayToString(tools)}
              fieldName="tools_used"
              profileId={profileId}
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">Keywords</h4>
            <EditableField
              label="Keywords"
              value={formatArrayToString(keywords)}
              fieldName="keywords"
              profileId={profileId}
            />
          </div>

          <div>
            <h4 className="font-semibold mb-2">Fields of Interest</h4>
            <EditableField
              label="Fields of Interest"
              value={formatArrayToString(fieldsOfInterest)}
              fieldName="fields_of_interest"
              profileId={profileId}
            />
          </div>
        </>
      ) : (
        <>
          {skills?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {tools?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tools</h4>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool, index) => (
                  <Badge 
                    key={index} 
                    className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {keywords?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    className="bg-[#FDE2E2] text-[#4B5563] hover:bg-[#FACACA] transition-colors border border-[#FAD4D4]"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {fieldsOfInterest?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Fields of Interest</h4>
              <div className="flex flex-wrap gap-2">
                {fieldsOfInterest.map((field, index) => (
                  <Badge 
                    key={index} 
                    className="bg-[#E2D4F0] text-[#4B5563] hover:bg-[#D4C4E3] transition-colors border border-[#D4C4E3]"
                  >
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
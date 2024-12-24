import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdditionalInfoProps {
  professional_associations?: string[];
  common_difficulties?: string[];
  certifications_to_consider?: string[];
  affiliated_programs?: string[];
  majors_to_consider_switching_to?: string[];
  job_prospects?: string;
  passion_for_subject?: string;
  global_applicability?: string;
}

export function AdditionalInfo({
  professional_associations,
  common_difficulties,
  certifications_to_consider,
  affiliated_programs,
  majors_to_consider_switching_to,
  job_prospects,
  passion_for_subject,
  global_applicability
}: AdditionalInfoProps) {
  const renderSection = (items: string[] | undefined, title: string, badgeClass: string) => {
    if (!items?.length) return null;
    return (
      <div className="space-y-2">
        <h5 className="text-sm font-medium">{title}</h5>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge 
              key={index}
              variant="outline"
              className={badgeClass}
            >
              {item}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Info className="h-5 w-5 text-primary" />
        Additional Information
      </h4>

      {renderSection(
        professional_associations,
        "Professional Associations",
        "bg-[#E5DEFF] text-[#4B5563] hover:bg-[#D8D1F2] transition-colors border border-[#D8D1F2]"
      )}

      {renderSection(
        common_difficulties,
        "Common Difficulties",
        "bg-[#FFDEE2] text-[#4B5563] hover:bg-[#FFD1D6] transition-colors border border-[#FFD1D6]"
      )}

      {renderSection(
        certifications_to_consider,
        "Recommended Certifications",
        "bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
      )}

      {renderSection(
        affiliated_programs,
        "Affiliated Programs",
        "bg-[#E5DEFF] text-[#4B5563] hover:bg-[#D8D1F2] transition-colors border border-[#D8D1F2]"
      )}

      {renderSection(
        majors_to_consider_switching_to,
        "Alternative Majors to Consider",
        "bg-[#FFDEE2] text-[#4B5563] hover:bg-[#FFD1D6] transition-colors border border-[#FFD1D6]"
      )}

      {job_prospects && (
        <div>
          <h5 className="text-sm font-medium mb-2">Job Prospects</h5>
          <p className="text-muted-foreground">{job_prospects}</p>
        </div>
      )}

      {passion_for_subject && (
        <div>
          <h5 className="text-sm font-medium mb-2">Passion for Subject</h5>
          <p className="text-muted-foreground">{passion_for_subject}</p>
        </div>
      )}

      {global_applicability && (
        <div>
          <h5 className="text-sm font-medium mb-2">Global Applicability</h5>
          <p className="text-muted-foreground">{global_applicability}</p>
        </div>
      )}
    </div>
  );
}
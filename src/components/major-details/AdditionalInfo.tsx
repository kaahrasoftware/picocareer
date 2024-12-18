import { 
  Globe, 
  AlertTriangle, 
  Heart,
  Award,
  Building 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdditionalInfoProps {
  intensity?: string;
  passion_for_subject?: string;
  stress_level?: string;
  dropout_rates?: string;
  common_difficulties?: string[];
  majors_to_consider_switching_to?: string[];
  certifications_to_consider?: string[];
}

export function AdditionalInfo({ 
  intensity,
  passion_for_subject,
  stress_level,
  dropout_rates,
  common_difficulties,
  majors_to_consider_switching_to,
  certifications_to_consider
}: AdditionalInfoProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <Globe className="h-4 w-4 text-primary" />
        Additional Information
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {intensity && (
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span><strong>Intensity Level:</strong> {intensity}</span>
          </div>
        )}

        {passion_for_subject && (
          <div className="flex items-start gap-2 text-sm">
            <Heart className="h-4 w-4 text-red-500" />
            <span><strong>Passion Rating:</strong> {passion_for_subject}</span>
          </div>
        )}

        {stress_level && (
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span><strong>Stress Level:</strong> {stress_level}</span>
          </div>
        )}

        {dropout_rates && (
          <div className="flex items-start gap-2 text-sm">
            <Building className="h-4 w-4 text-primary" />
            <span><strong>Dropout Rate:</strong> {dropout_rates}</span>
          </div>
        )}
      </div>

      {common_difficulties && common_difficulties.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Common Challenges</h5>
          <div className="flex flex-wrap gap-2">
            {common_difficulties.map((difficulty, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#FFDEE2] text-[#4B5563]"
              >
                {difficulty}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {majors_to_consider_switching_to && majors_to_consider_switching_to.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Alternative Majors to Consider</h5>
          <div className="flex flex-wrap gap-2">
            {majors_to_consider_switching_to.map((major, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#F2FCE2] text-[#4B5563]"
              >
                {major}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {certifications_to_consider && certifications_to_consider.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Recommended Certifications</h5>
          <div className="flex flex-wrap gap-2">
            {certifications_to_consider.map((cert, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#D3E4FD] text-[#4B5563]"
              >
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
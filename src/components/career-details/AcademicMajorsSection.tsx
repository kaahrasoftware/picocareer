import { Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { badgeStyles } from "./BadgeStyles";
import { useState } from "react";
import { MajorDetails } from "@/components/MajorDetails";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AcademicMajorsSectionProps {
  academicMajors?: string[];
}

export function AcademicMajorsSection({ academicMajors }: AcademicMajorsSectionProps) {
  const [selectedMajor, setSelectedMajor] = useState<any | null>(null);

  const { data: majorsData } = useQuery({
    queryKey: ['majors-by-titles', academicMajors],
    queryFn: async () => {
      if (!academicMajors?.length) return [];
      
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .in('title', academicMajors);

      if (error) {
        console.error('Error fetching majors:', error);
        return [];
      }

      return data;
    },
    enabled: !!academicMajors?.length,
  });

  if (!academicMajors?.length) return null;

  const getMajorByTitle = (title: string) => {
    return majorsData?.find(major => major.title === title);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
        <Book className="h-5 w-5 text-primary" />
        Academic Majors
      </h3>
      <div className="flex flex-wrap gap-2">
        {academicMajors.map((major, index) => {
          const matchingMajor = getMajorByTitle(major);
          const badgeClass = `${badgeStyles.primary} ${matchingMajor ? 'cursor-pointer hover:bg-muted/80' : ''}`;
          
          return (
            <Badge 
              key={index}
              className={badgeClass}
              onClick={() => matchingMajor && setSelectedMajor(matchingMajor)}
            >
              {major}
            </Badge>
          );
        })}
      </div>

      {selectedMajor && (
        <MajorDetails
          major={selectedMajor}
          open={!!selectedMajor}
          onOpenChange={(open) => !open && setSelectedMajor(null)}
        />
      )}
    </div>
  );
}
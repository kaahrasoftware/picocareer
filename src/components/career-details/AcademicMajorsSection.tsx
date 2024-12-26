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

  // Fetch majors data from both direct academic_majors and career_major_relations
  const { data: majorsData } = useQuery({
    queryKey: ['majors-data', academicMajors],
    queryFn: async () => {
      if (!academicMajors?.length) return [];
      
      // First, get majors by titles from academic_majors array
      const { data: directMajors, error: directError } = await supabase
        .from('majors')
        .select('*')
        .in('title', academicMajors);

      if (directError) {
        console.error('Error fetching direct majors:', directError);
        return [];
      }

      return directMajors || [];
    },
    enabled: !!academicMajors?.length,
  });

  if (!academicMajors?.length && !majorsData?.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
        <Book className="h-5 w-5 text-primary" />
        Academic Majors
      </h3>
      <div className="flex flex-wrap gap-2">
        {majorsData?.map((major) => (
          <Badge 
            key={major.id}
            className={`${badgeStyles.primary} cursor-pointer hover:bg-muted/80`}
            onClick={() => setSelectedMajor(major)}
          >
            {major.title}
          </Badge>
        ))}
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
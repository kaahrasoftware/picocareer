
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MajorCard } from "@/components/MajorCard";
import { SkeletonCard } from "@/components/ui/skeleton-card";

interface SchoolMajor {
  major_id: string;
  program_details: string | null;
  program_url: string | null;
  major_title: string;
  degree_levels: string[] | null;
  majors?: {
    id: string;
    title: string;
    description: string;
    potential_salary: string | null;
    skill_match: string[] | null;
    tools_knowledge: string[] | null;
    common_courses: string[] | null;
    degree_levels: string[] | null;
    learning_objectives: string[] | null;
    interdisciplinary_connections: string[] | null;
    job_prospects: string | null;
    certifications_to_consider: string[] | null;
    affiliated_programs: string[] | null;
    gpa_expectations: number | null;
    transferable_skills: string[] | null;
    passion_for_subject: string | null;
    professional_associations: string[] | null;
    global_applicability: string | null;
    common_difficulties: string[] | null;
    career_opportunities: string[] | null;
    intensity: string | null;
    stress_level: string | null;
    dropout_rates: string | null;
    majors_to_consider_switching_to: string[] | null;
    profiles_count: number | null;
  }
}

interface SchoolMajorsListProps {
  schoolId: string;
}

export function SchoolMajorsList({ schoolId }: SchoolMajorsListProps) {
  const [majors, setMajors] = useState<SchoolMajor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (schoolId) {
      fetchSchoolMajors();
    }
  }, [schoolId]);

  const fetchSchoolMajors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('school_majors')
        .select(`
          major_id,
          program_details,
          program_url,
          majors (
            id,
            title,
            description,
            potential_salary,
            skill_match,
            tools_knowledge,
            common_courses,
            degree_levels,
            learning_objectives,
            interdisciplinary_connections,
            job_prospects,
            certifications_to_consider,
            affiliated_programs,
            gpa_expectations,
            transferable_skills,
            passion_for_subject,
            professional_associations,
            global_applicability,
            common_difficulties,
            career_opportunities,
            intensity,
            stress_level,
            dropout_rates,
            majors_to_consider_switching_to,
            profiles_count
          )
        `)
        .eq('school_id', schoolId);

      if (error) throw error;

      setMajors(data as SchoolMajor[]);
    } catch (error) {
      console.error('Error fetching school majors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load programs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (majors.length === 0) {
    return (
      <div className="text-center py-10">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No programs available for this school yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Available Programs</h3>
        <Badge variant="outline">{majors.length} Programs</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {majors.map((major) => {
          if (!major.majors) return null;
          
          return (
            <MajorCard
              key={major.major_id}
              id={major.majors.id}
              title={major.majors.title}
              description={major.majors.description}
              potential_salary={major.majors.potential_salary}
              skill_match={major.majors.skill_match}
              tools_knowledge={major.majors.tools_knowledge}
              common_courses={major.majors.common_courses}
              degree_levels={major.majors.degree_levels}
              learning_objectives={major.majors.learning_objectives}
              interdisciplinary_connections={major.majors.interdisciplinary_connections}
              job_prospects={major.majors.job_prospects}
              certifications_to_consider={major.majors.certifications_to_consider}
              affiliated_programs={major.majors.affiliated_programs}
              gpa_expectations={major.majors.gpa_expectations}
              transferable_skills={major.majors.transferable_skills}
              passion_for_subject={major.majors.passion_for_subject}
              professional_associations={major.majors.professional_associations}
              global_applicability={major.majors.global_applicability}
              common_difficulties={major.majors.common_difficulties}
              career_opportunities={major.majors.career_opportunities}
              intensity={major.majors.intensity}
              stress_level={major.majors.stress_level}
              dropout_rates={major.majors.dropout_rates}
              majors_to_consider_switching_to={major.majors.majors_to_consider_switching_to}
              profiles_count={major.majors.profiles_count}
              programDetails={major.program_details}
              programUrl={major.program_url}
            />
          );
        })}
      </div>
    </div>
  );
}

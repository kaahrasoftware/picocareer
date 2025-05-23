
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MajorCard } from "@/components/MajorCard";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { School } from "@/types/database/schools";

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
  school?: School;
}

export function SchoolMajorsList({ schoolId, school }: SchoolMajorsListProps) {
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

  const renderExternalLink = (url: string | null | undefined, label: string, icon: React.ReactNode, variant: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" = "outline", colorClass?: string) => {
    if (!url) return null;
    
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant, size: "sm" }),
          "gap-2 whitespace-nowrap transition-all hover:shadow-md",
          colorClass
        )}
      >
        {icon}
        <span>{label}</span>
        <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
      </a>
    );
  };

  const showProgramDirectoriesSection = school && (school.undergrad_programs_link || school.grad_programs_link);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showProgramDirectoriesSection && (
        <div className="bg-card border rounded-lg p-6 shadow-sm bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4">Program Directories</h2>
          <div className="flex flex-wrap gap-3">
            {renderExternalLink(
              school?.undergrad_programs_link,
              "Undergraduate Programs Directory",
              <GraduationCap className="h-4 w-4" />,
              "default",
              "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none"
            )}
            
            {renderExternalLink(
              school?.grad_programs_link,
              "Graduate Programs Directory",
              <GraduationCap className="h-4 w-4" />,
              "default",
              "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-none"
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Available Programs</h3>
        <Badge variant="outline">{majors.length} Programs</Badge>
      </div>
      
      {majors.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No programs available for this school yet.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}

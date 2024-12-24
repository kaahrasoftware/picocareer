import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Progress } from "@/components/ui/progress";

interface CareerDetailsDialogProps {
  careerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extended type to include all career properties
type CareerWithMajors = Tables<"careers"> & {
  career_major_relations: {
    major: {
      title: string;
      id: string;
    };
  }[];
  average_salary?: number;
  potential_salary?: number;
  tuition_and_fees?: number;
  intensity?: number;
  dropout_rates?: number;
  degree_levels?: string[];
  learning_objectives?: string[];
  common_courses?: string[];
  tools_knowledge?: string[];
  skill_match?: string[];
  professional_associations?: string[];
  common_difficulties?: string[];
  certifications_to_consider?: string[];
  affiliated_programs?: string[];
  majors_to_consider_switching_to?: string[];
  job_prospects?: string;
  passion_for_subject?: string;
  global_applicability?: string;
};

export function CareerDetailsDialog({ careerId, open, onOpenChange }: CareerDetailsDialogProps) {
  const { data: career, isLoading } = useQuery({
    queryKey: ['career', careerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select(`
          *,
          career_major_relations(
            major:majors(id, title)
          )
        `)
        .eq('id', careerId)
        .single();

      if (error) throw error;
      return data as CareerWithMajors;
    },
    enabled: open && !!careerId,
  });

  if (!open) return null;
  if (isLoading) return <div>Loading...</div>;
  if (!career) return <div>Career not found</div>;

  const renderMetricBar = (value: string | null, label: string) => {
    if (value === null) return null;
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{numericValue}/10</span>
        </div>
        <Progress value={numericValue * 10} className="h-2" />
      </div>
    );
  };

  const renderArraySection = (items: string[] | null, title: string) => {
    if (!items?.length) return null;
    return (
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-foreground">{career.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{career.description}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)] px-6">
          <div className="space-y-6 pb-6">
            {career.image_url && (
              <img src={career.image_url} alt={career.title} className="w-full h-48 object-cover rounded-lg" />
            )}
            
            {career.career_major_relations && career.career_major_relations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Related Majors</h3>
                <div className="flex flex-wrap gap-2">
                  {career.career_major_relations.map(({ major }) => (
                    <span key={major.id} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {major.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Industry:</span>
                <span className="ml-2">{career.industry}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Salary Range:</span>
                <span className="ml-2">{career.salary_range || `$${career.average_salary?.toLocaleString()}`}</span>
              </div>
              {career.potential_salary && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Potential Salary:</span>
                  <span className="ml-2">${career.potential_salary.toLocaleString()}</span>
                </div>
              )}
              {career.tuition_and_fees && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Tuition & Fees:</span>
                  <span className="ml-2">${career.tuition_and_fees.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {renderMetricBar(career.intensity?.toString(), "Career Intensity")}
              {renderMetricBar(career.stress_levels, "Stress Levels")}
              {career.dropout_rates && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Dropout Rate:</span>
                  <span className="ml-2">{(career.dropout_rates * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>

            {renderArraySection(career.required_education, "Required Education")}
            {renderArraySection(career.degree_levels, "Degree Levels")}
            {renderArraySection(career.learning_objectives, "Learning Objectives")}
            {renderArraySection(career.common_courses, "Common Courses")}
            {renderArraySection(career.required_skills, "Required Skills")}
            {renderArraySection(career.required_tools, "Required Tools")}
            {renderArraySection(career.tools_knowledge, "Tools & Knowledge")}
            {renderArraySection(career.transferable_skills, "Transferable Skills")}
            {renderArraySection(career.skill_match, "Skill Match")}
            {renderArraySection(career.professional_associations, "Professional Associations")}
            {renderArraySection(career.common_difficulties, "Common Difficulties")}
            {renderArraySection(career.certifications_to_consider, "Recommended Certifications")}
            {renderArraySection(career.affiliated_programs, "Affiliated Programs")}
            {renderArraySection(career.majors_to_consider_switching_to, "Alternative Majors to Consider")}

            {career.job_prospects && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Job Prospects</h3>
                <p className="text-muted-foreground">{career.job_prospects}</p>
              </div>
            )}

            {career.work_environment && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Work Environment</h3>
                <p className="text-muted-foreground">{career.work_environment}</p>
              </div>
            )}

            {career.growth_potential && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Growth Potential</h3>
                <p className="text-muted-foreground">{career.growth_potential}</p>
              </div>
            )}

            {career.passion_for_subject && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Passion for Subject</h3>
                <p className="text-muted-foreground">{career.passion_for_subject}</p>
              </div>
            )}

            {career.global_applicability && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Global Applicability</h3>
                <p className="text-muted-foreground">{career.global_applicability}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
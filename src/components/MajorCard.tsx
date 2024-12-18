import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MajorDetails } from "./MajorDetails";
import { MajorHeader } from "./major/MajorHeader";
import { MajorSalary } from "./major/MajorSalary";
import { MajorSkillsList } from "./major/MajorSkillsList";

interface MajorCardProps {
  id?: string;
  title: string;
  description: string;
  potential_salary?: string;
  skill_match?: string[];
  tools_knowledge?: string[];
  common_courses?: string[];
  profiles_count?: number;
  degree_levels?: string[];
  learning_objectives?: string[];
  interdisciplinary_connections?: string[];
  job_prospects?: string;
  certifications_to_consider?: string[];
  affiliated_programs?: string[];
  gpa_expectations?: number;
  transferable_skills?: string[];
  passion_for_subject?: string;
  professional_associations?: string[];
  global_applicability?: string;
  common_difficulties?: string[];
  career_opportunities?: string[];
  intensity?: string;
  stress_level?: string;
  dropout_rates?: string;
  majors_to_consider_switching_to?: string[];
}

export function MajorCard(props: MajorCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden p-6 h-full flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex flex-col h-full">
          <MajorHeader 
            title={props.title}
            description={props.description}
            profilesCount={props.profiles_count}
          />

          <MajorSalary potentialSalary={props.potential_salary} />

          <MajorSkillsList
            title="Key Skills"
            items={props.skill_match}
            icon="skills"
            badgeStyle="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9] dark:bg-[#2A3428] dark:text-[#A1B99D]"
          />

          <MajorSkillsList
            title="Tools & Technologies"
            items={props.tools_knowledge}
            icon="tools"
            badgeStyle="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9] dark:bg-[#1E2A3D] dark:text-[#9FB7D4]"
          />

          <MajorSkillsList
            title="Common Courses"
            items={props.common_courses}
            icon="courses"
            badgeStyle="bg-[#FFDEE2] text-[#4B5563] hover:bg-[#FFD1D6] transition-colors border border-[#FFD1D6] dark:bg-[#2D2326] dark:text-[#D4A1A8]"
          />

          <div className="mt-auto pt-4">
            <Button 
              variant="outline"
              className="w-full bg-background hover:bg-muted/50 transition-colors"
              onClick={() => setDialogOpen(true)}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>

      <MajorDetails
        major={{
          id: props.id || '',
          title: props.title,
          description: props.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          featured: false,
          learning_objectives: props.learning_objectives || [],
          common_courses: props.common_courses || [],
          interdisciplinary_connections: props.interdisciplinary_connections || [],
          job_prospects: props.job_prospects || null,
          certifications_to_consider: props.certifications_to_consider || [],
          degree_levels: props.degree_levels || [],
          affiliated_programs: props.affiliated_programs || [],
          gpa_expectations: props.gpa_expectations || null,
          transferable_skills: props.transferable_skills || [],
          tools_knowledge: props.tools_knowledge || [],
          potential_salary: props.potential_salary || null,
          passion_for_subject: props.passion_for_subject || null,
          skill_match: props.skill_match || [],
          professional_associations: props.professional_associations || [],
          global_applicability: props.global_applicability || null,
          common_difficulties: props.common_difficulties || [],
          career_opportunities: props.career_opportunities || [],
          intensity: props.intensity || null,
          stress_level: props.stress_level || null,
          dropout_rates: props.dropout_rates || null,
          majors_to_consider_switching_to: props.majors_to_consider_switching_to || [],
          profiles_count: props.profiles_count,
        }}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
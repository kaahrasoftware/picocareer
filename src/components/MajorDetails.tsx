import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  GraduationCap, 
  Lightbulb, 
  Link as LinkIcon,
  BookOpen,
  Briefcase,
  Wrench,
  Globe
} from "lucide-react";
import type { Major } from "@/types/database/majors";

interface MajorDetailsProps {
  major: Major;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetails({ major, open, onOpenChange }: MajorDetailsProps) {
  if (!major) return null;

  const formatProfileCount = (count: number | undefined) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + "K";
    return (count / 1000000).toFixed(1) + "M";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl font-bold">{major.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatProfileCount(major.profiles_count)} Active Students
              </span>
            </div>
          </div>
          {major.degree_levels && major.degree_levels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {major.degree_levels.map((level, index) => (
                <Badge key={index} variant="outline" className="bg-[#F2FCE2] text-[#4B5563]">
                  {level}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)] px-6">
          <div className="space-y-6 pb-6">
            {/* About Section */}
            <section className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                About this Major
              </h4>
              <p className="text-muted-foreground">{major.description}</p>
              
              {major.learning_objectives && major.learning_objectives.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Learning Objectives
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {major.learning_objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              {major.interdisciplinary_connections && major.interdisciplinary_connections.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-primary" />
                    Interdisciplinary Connections
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {major.interdisciplinary_connections.map((connection, index) => (
                      <Badge key={index} variant="outline" className="bg-[#D3E4FD] text-[#4B5563]">
                        {connection}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Academic Requirements */}
            <section className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Academic Requirements
              </h4>
              
              {major.gpa_expectations && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Expected GPA: {major.gpa_expectations}</Badge>
                </div>
              )}

              {major.affiliated_programs && major.affiliated_programs.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Affiliated Programs</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.affiliated_programs.map((program, index) => (
                      <Badge key={index} variant="outline" className="bg-[#F2FCE2] text-[#4B5563]">
                        {program}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Career Prospects */}
            <section className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Career Prospects
              </h4>

              {major.job_prospects && (
                <p className="text-sm text-muted-foreground">{major.job_prospects}</p>
              )}

              {major.career_opportunities && major.career_opportunities.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Career Opportunities</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.career_opportunities.map((career, index) => (
                      <Badge key={index} variant="outline" className="bg-[#D3E4FD] text-[#4B5563]">
                        {career}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.professional_associations && major.professional_associations.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Professional Associations</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.professional_associations.map((association, index) => (
                      <Badge key={index} variant="outline" className="bg-[#F2FCE2] text-[#4B5563]">
                        {association}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.global_applicability && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Global Applicability</h5>
                  <p className="text-sm text-muted-foreground">{major.global_applicability}</p>
                </div>
              )}
            </section>

            {/* Skills & Tools */}
            <section className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Skills & Tools
              </h4>

              {major.skill_match && major.skill_match.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Key Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.skill_match.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-[#F2FCE2] text-[#4B5563]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.transferable_skills && major.transferable_skills.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Transferable Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.transferable_skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-[#D3E4FD] text-[#4B5563]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Additional Information */}
            <section className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Additional Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {major.intensity && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Intensity Level: {major.intensity}</span>
                  </div>
                )}

                {major.passion_for_subject && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Passion Rating: {major.passion_for_subject}</span>
                  </div>
                )}

                {major.stress_level && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Stress Level: {major.stress_level}</span>
                  </div>
                )}

                {major.dropout_rates && (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Dropout Rate: {major.dropout_rates}</span>
                  </div>
                )}
              </div>

              {major.common_difficulties && major.common_difficulties.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Common Challenges</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.common_difficulties.map((difficulty, index) => (
                      <Badge key={index} variant="outline" className="bg-[#FFDEE2] text-[#4B5563]">
                        {difficulty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.majors_to_consider_switching_to && major.majors_to_consider_switching_to.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Alternative Majors to Consider</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.majors_to_consider_switching_to.map((major, index) => (
                      <Badge key={index} variant="outline" className="bg-[#F2FCE2] text-[#4B5563]">
                        {major}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.certifications_to_consider && major.certifications_to_consider.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Recommended Certifications</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.certifications_to_consider.map((cert, index) => (
                      <Badge key={index} variant="outline" className="bg-[#D3E4FD] text-[#4B5563]">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  DollarSign, 
  Users,
  Lightbulb,
  Wrench,
  Globe,
  AlertTriangle,
  Heart,
  Award,
  Building
} from "lucide-react";

interface MajorDetailsDialogProps {
  major: {
    title: string;
    description: string;
    users?: string;
    imageUrl?: string;
    learning_objectives?: string[];
    common_courses?: string[];
    interdisciplinary_connections?: string[];
    job_prospects?: string;
    certifications_to_consider?: string[];
    degree_levels?: string[];
    affiliated_programs?: string[];
    gpa_expectations?: number;
    transferable_skills?: string[];
    tools_knowledge?: string[];
    tuition_and_fees?: string;
    potential_salary?: string;
    passion_for_subject?: string;
    skill_match?: string[];
    professional_associations?: string[];
    global_applicability?: string;
    common_difficulties?: string[];
    career_opportunities?: string[];
    intensity?: string;
    stress_level?: string;
    dropout_rates?: string;
    profiles_count?: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetailsDialog({ major, open, onOpenChange }: MajorDetailsDialogProps) {
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
            <div className="space-y-4">
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
            </div>

            {/* Academic Requirements */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Academic Requirements
              </h4>
              
              {major.gpa_expectations && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Expected GPA: {major.gpa_expectations}</Badge>
                </div>
              )}

              {major.common_courses && major.common_courses.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Required Courses</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.common_courses.map((course, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="bg-[#FFDEE2] text-[#4B5563] border-[#FFD1D6]"
                      >
                        {course}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Career Prospects */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Career Prospects
              </h4>
              
              {major.potential_salary && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span>Potential Salary: {major.potential_salary}</span>
                </div>
              )}

              {major.career_opportunities && major.career_opportunities.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Career Opportunities</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.career_opportunities.map((career, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="bg-[#D3E4FD] text-[#4B5563] border-[#C1D9F9]"
                      >
                        {career}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.job_prospects && (
                <p className="text-sm text-muted-foreground">{major.job_prospects}</p>
              )}
            </div>

            {/* Skills & Tools */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Skills & Tools
              </h4>

              {major.skill_match && major.skill_match.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Key Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.skill_match.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="bg-[#F2FCE2] text-[#4B5563] border-[#E2EFD9]"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.tools_knowledge && major.tools_knowledge.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Tools & Technologies</h5>
                  <div className="flex flex-wrap gap-2">
                    {major.tools_knowledge.map((tool, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="bg-[#D3E4FD] text-[#4B5563] border-[#C1D9F9]"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Additional Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {major.intensity && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Intensity Level: {major.intensity}</span>
                  </div>
                )}

                {major.passion_for_subject && (
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Passion Rating: {major.passion_for_subject}</span>
                  </div>
                )}

                {major.professional_associations && major.professional_associations.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-primary" />
                    <span>{major.professional_associations.length} Professional Associations</span>
                  </div>
                )}

                {major.certifications_to_consider && major.certifications_to_consider.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span>{major.certifications_to_consider.length} Available Certifications</span>
                  </div>
                )}
              </div>

              {major.global_applicability && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Global Applicability</h5>
                  <p className="text-sm text-muted-foreground">{major.global_applicability}</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
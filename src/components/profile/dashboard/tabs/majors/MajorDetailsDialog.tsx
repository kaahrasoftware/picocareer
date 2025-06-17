
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Major } from "@/types/database/majors";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface MajorDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  major: Major;
}

export function MajorDetailsDialog({
  open,
  onClose,
  major
}: MajorDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{major.title}</DialogTitle>
          <DialogDescription className="flex justify-between items-center">
            <span>Complete details about this major</span>
            <Badge variant={major.featured ? "default" : "outline"} className="ml-2">
              {major.featured ? "Featured" : "Not Featured"}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="career">Career</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{major.description}</p>
              </div>

              {major.learning_objectives && major.learning_objectives.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Learning Objectives</h3>
                  <ul className="list-disc pl-5">
                    {major.learning_objectives.map((objective, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              {major.common_courses && major.common_courses.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Common Courses</h3>
                  <div className="flex flex-wrap gap-2">
                    {major.common_courses.map((course, i) => (
                      <Badge key={i} variant="outline" className="bg-background">
                        {course}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.interdisciplinary_connections && major.interdisciplinary_connections.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Interdisciplinary Connections</h3>
                  <div className="flex flex-wrap gap-2">
                    {major.interdisciplinary_connections.map((connection, i) => (
                      <Badge key={i} variant="outline" className="bg-background">
                        {connection}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              {major.gpa_expectations && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">GPA Expectations</h3>
                  <p className="text-sm text-muted-foreground">{major.gpa_expectations}</p>
                </div>
              )}

              {major.degree_levels && major.degree_levels.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Degree Levels</h3>
                  <div className="flex flex-wrap gap-2">
                    {major.degree_levels.map((degree, i) => (
                      <Badge key={i} variant="outline" className="bg-background">
                        {degree}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.affiliated_programs && major.affiliated_programs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Affiliated Programs</h3>
                  <div className="flex flex-wrap gap-2">
                    {major.affiliated_programs.map((program, i) => (
                      <Badge key={i} variant="outline" className="bg-background">
                        {program}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.tools_knowledge && major.tools_knowledge.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Tools & Knowledge</h3>
                  <div className="flex flex-wrap gap-2">
                    {major.tools_knowledge.map((tool, i) => (
                      <Badge key={i} variant="outline" className="bg-background">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.transferable_skills && major.transferable_skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Transferable Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {major.transferable_skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="bg-background">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="career" className="space-y-4">
              {major.job_prospects && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Job Prospects</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{major.job_prospects}</p>
                </div>
              )}

              {major.potential_salary && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Potential Salary</h3>
                  <p className="text-sm text-muted-foreground">{major.potential_salary}</p>
                </div>
              )}

              {major.career_opportunities && major.career_opportunities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Career Opportunities</h3>
                  <div className="flex flex-wrap gap-2">
                    {major.career_opportunities.map((opportunity, i) => (
                      <Badge key={i} variant="outline" className="bg-background">
                        {opportunity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.professional_associations && major.professional_associations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Professional Associations</h3>
                  <div className="flex flex-wrap gap-2">
                    {major.professional_associations.map((association, i) => (
                      <Badge key={i} variant="outline" className="bg-background">
                        {association}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {major.global_applicability && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Global Applicability</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{major.global_applicability}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="challenges" className="space-y-4">
              {major.intensity && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Intensity</h3>
                  <p className="text-sm text-muted-foreground">{major.intensity}</p>
                </div>
              )}

              {major.stress_level && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Stress Level</h3>
                  <p className="text-sm text-muted-foreground">{major.stress_level}</p>
                </div>
              )}

              {major.dropout_rates && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Dropout Rate</h3>
                  <p className="text-sm text-muted-foreground">{major.dropout_rates}</p>
                </div>
              )}

              {major.common_difficulties && major.common_difficulties.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Common Difficulties</h3>
                  <ul className="list-disc pl-5">
                    {major.common_difficulties.map((difficulty, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{difficulty}</li>
                    ))}
                  </ul>
                </div>
              )}

              {major.majors_to_consider_switching_to && major.majors_to_consider_switching_to.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Alternative Majors to Consider</h3>
                  <div className="flex flex-wrap gap-2">
                    {major.majors_to_consider_switching_to.map((altMajor, i) => (
                      <Badge key={i} variant="outline" className="bg-background">
                        {altMajor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-xs text-muted-foreground">
            <p>Created: {new Date(major.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(major.updated_at).toLocaleString()}</p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

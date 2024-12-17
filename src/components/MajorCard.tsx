import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MajorDetailsDialog } from "./MajorDetailsDialog";
import { Badge } from "@/components/ui/badge";

interface MajorCardProps {
  title: string;
  description: string;
  users?: string;
  imageUrl?: string;
  relatedCareers?: string[];
  requiredCourses?: string[];
  averageGPA?: string;
  image_url?: string;
  field_of_study?: string;
  degree_level?: string;
  potential_salary?: string;
  skill_match?: string[];
  tools_knowledge?: string[];
  common_courses?: string[];
}

export function MajorCard(props: MajorCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Transform the data to match the expected format
  const majorData = {
    title: props.title,
    description: props.description,
    users: props.users || '0',
    imageUrl: props.imageUrl || props.image_url || '',
    relatedCareers: props.relatedCareers || [],
    requiredCourses: props.requiredCourses || [],
    averageGPA: props.averageGPA || 'N/A',
    fieldOfStudy: props.field_of_study,
    degreeLevel: props.degree_level,
    potentialSalary: props.potential_salary || 'N/A',
    skillMatch: props.skill_match || [],
    toolsKnowledge: props.tools_knowledge || [],
    commonCourses: props.common_courses || []
  };

  return (
    <>
      <Card 
        className="relative p-6 group cursor-pointer transition-all duration-300 hover:scale-105 bg-card hover:bg-card/80"
        onClick={() => setDialogOpen(true)}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{majorData.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{majorData.description}</p>
          </div>

          {majorData.potentialSalary && (
            <div>
              <p className="text-sm font-semibold mb-1">Potential Salary</p>
              <p className="text-primary">{majorData.potentialSalary}</p>
            </div>
          )}

          {majorData.skillMatch && majorData.skillMatch.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-1">Key Skills</p>
              <div className="flex flex-wrap gap-1">
                {majorData.skillMatch.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {majorData.toolsKnowledge && majorData.toolsKnowledge.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-1">Tools & Technologies</p>
              <div className="flex flex-wrap gap-1">
                {majorData.toolsKnowledge.slice(0, 3).map((tool, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {majorData.commonCourses && majorData.commonCourses.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-1">Common Courses</p>
              <div className="flex flex-wrap gap-1">
                {majorData.commonCourses.slice(0, 2).map((course, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {course}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end text-sm text-muted-foreground mt-4">
            <span>{majorData.users} Users</span>
          </div>
        </div>
      </Card>
      <MajorDetailsDialog 
        major={majorData}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
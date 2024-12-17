import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MajorDetailsDialog } from "./MajorDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, DollarSign, BookOpen, Wrench, Lightbulb, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MajorCardProps {
  id?: string;
  title: string;
  description: string;
  potential_salary?: string;
  skill_match?: string[];
  tools_knowledge?: string[];
  common_courses?: string[];
  profiles_count?: number;
}

export function MajorCard(props: MajorCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Function to get first three items of an array
  const getFirstThree = (arr: string[] | undefined) => {
    return arr ? arr.slice(0, 3) : [];
  };

  // Function to format profile count
  const formatProfileCount = (count: number | undefined) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + "K";
    if (count < 1000000000) return (count / 1000000).toFixed(1) + "M";
    return (count / 1000000000).toFixed(1) + "T";
  };

  return (
    <>
      <Card className="group relative overflow-hidden p-6 h-full flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex flex-col h-full">
          {/* Header Section with Title and Basic Info */}
          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg text-foreground">{props.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{formatProfileCount(props.profiles_count)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{props.description}</p>
            </div>
          </div>

          {/* Potential Salary Section */}
          {props.potential_salary && (
            <div className="mb-4 flex items-center gap-2 text-foreground/90">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Potential Salary: {props.potential_salary}
              </span>
            </div>
          )}

          {/* Skills Section */}
          {props.skill_match && props.skill_match.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Key Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {getFirstThree(props.skill_match).map((skill, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9] dark:bg-[#2A3428] dark:text-[#A1B99D]"
                  >
                    {skill}
                  </Badge>
                ))}
                {props.skill_match.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{props.skill_match.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tools Section */}
          {props.tools_knowledge && props.tools_knowledge.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Tools & Technologies</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {getFirstThree(props.tools_knowledge).map((tool, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="text-xs bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9] dark:bg-[#1E2A3D] dark:text-[#9FB7D4]"
                  >
                    {tool}
                  </Badge>
                ))}
                {props.tools_knowledge.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{props.tools_knowledge.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Common Courses Section */}
          {props.common_courses && props.common_courses.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Common Courses</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {getFirstThree(props.common_courses).map((course, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="text-xs bg-[#FFDEE2] text-[#4B5563] hover:bg-[#FFD1D6] transition-colors border border-[#FFD1D6] dark:bg-[#2D2326] dark:text-[#D4A1A8]"
                  >
                    {course}
                  </Badge>
                ))}
                {props.common_courses.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{props.common_courses.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* View Details Button */}
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

      <MajorDetailsDialog
        major={{
          ...props,
          imageUrl: '',
          users: '0',
          relatedCareers: [],
          requiredCourses: [],
          averageGPA: 'N/A',
        }}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
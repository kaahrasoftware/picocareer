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
        className="relative p-6 group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 hover:border-primary"
        onClick={() => setDialogOpen(true)}
      >
        <div className="space-y-4">
          {/* Title and Description Section */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{majorData.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{majorData.description}</p>
          </div>

          {/* Potential Salary Section */}
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Potential Salary</p>
            <p className="text-lg font-bold text-primary">{majorData.potentialSalary}</p>
          </div>

          {/* Skills Section */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Key Skills</p>
            <div className="flex flex-wrap gap-2">
              {majorData.skillMatch.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] dark:bg-[#2A3428] dark:text-[#A1B99D]">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tools Section */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tools & Technologies</p>
            <div className="flex flex-wrap gap-2">
              {majorData.toolsKnowledge.slice(0, 3).map((tool, index) => (
                <Badge key={index} variant="outline" className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] dark:bg-[#1E2A3D] dark:text-[#9FB7D4] border-none">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          {/* Common Courses Section */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Common Courses</p>
            <div className="flex flex-wrap gap-2">
              {majorData.commonCourses.slice(0, 3).map((course, index) => (
                <Badge key={index} variant="secondary" className="bg-[#FFDEE2] text-[#4B5563] hover:bg-[#FFD1D6] dark:bg-[#2D2326] dark:text-[#D4A1A8]">
                  {course}
                </Badge>
              ))}
            </div>
          </div>

          {/* Users Count */}
          <div className="flex justify-end text-sm text-gray-500 dark:text-gray-400">
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
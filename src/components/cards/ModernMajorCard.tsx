
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MajorDetails } from "@/components/MajorDetails";
import { GraduationCap, TrendingUp, Users, BookOpen, Lightbulb, Target } from "lucide-react";

interface ModernMajorCardProps {
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
  programDetails?: string | null;
  programUrl?: string | null;
}

export function ModernMajorCard(props: ModernMajorCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const getSubjectColor = (title: string) => {
    const colors = {
      'engineering': 'from-blue-500 to-cyan-500',
      'business': 'from-green-500 to-emerald-500',
      'computer': 'from-purple-500 to-violet-500',
      'medicine': 'from-red-500 to-pink-500',
      'arts': 'from-orange-500 to-yellow-500',
      'science': 'from-teal-500 to-blue-500',
      'default': 'from-gray-500 to-slate-500'
    };
    
    const titleLower = title.toLowerCase();
    const colorKey = Object.keys(colors).find(key => 
      key !== 'default' && titleLower.includes(key)
    ) || 'default';
    
    return colors[colorKey as keyof typeof colors];
  };

  return (
    <>
      <Card className="group relative overflow-hidden h-full flex flex-col bg-gradient-to-br from-white via-white to-gray-50/30 hover:shadow-2xl transition-all duration-500 border-0">
        {/* Decorative top gradient */}
        <div className={`h-2 bg-gradient-to-r ${getSubjectColor(props.title)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
        
        <div className="p-6 flex flex-col h-full">
          {/* Header Section */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                {props.title}
              </h3>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSubjectColor(props.title)} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
              {props.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {props.potential_salary && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-100 hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Salary</span>
                </div>
                <p className="font-semibold text-green-800 text-sm">{props.potential_salary}</p>
              </div>
            )}
            
            {props.profiles_count && (
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 hover:bg-purple-100 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Mentors</span>
                </div>
                <p className="font-semibold text-purple-800 text-sm">{props.profiles_count}</p>
              </div>
            )}
          </div>

          {/* Skills Section */}
          {props.skill_match && props.skill_match.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">Key Skills</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {props.skill_match.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors">
                    {skill}
                  </Badge>
                ))}
                {props.skill_match.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                    +{props.skill_match.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tools Section */}
          {props.tools_knowledge && props.tools_knowledge.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium text-gray-700">Tools & Tech</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {props.tools_knowledge.slice(0, 3).map((tool, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors">
                    {tool}
                  </Badge>
                ))}
                {props.tools_knowledge.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                    +{props.tools_knowledge.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Courses Preview */}
          {props.common_courses && props.common_courses.length > 0 && (
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal-600" />
                <span className="text-xs font-medium text-gray-700">Common Courses</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {props.common_courses.slice(0, 2).map((course, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100 transition-colors">
                    {course}
                  </Badge>
                ))}
                {props.common_courses.length > 2 && (
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                    +{props.common_courses.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="mt-auto">
            <Button 
              variant="outline"
              className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 font-medium"
              onClick={() => setDialogOpen(true)}
            >
              Explore Major Details
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


import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Briefcase, GraduationCap, Building2, TrendingUp, Users, Zap, Clock } from 'lucide-react';
import { CareerCardProps } from '@/components/CareerCard';

export function ModernCareerCard({
  id,
  title,
  description,
  matchScore,
  salary,
  salary_range,
  requiredSkills = [],
  education = [],
  industry,
  onClick,
  required_education = [],
  transferable_skills = [],
  profiles_count = 0
}: CareerCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const displaySalary = salary_range || salary;
  const skillsToShow = requiredSkills.length > 0 ? requiredSkills : transferable_skills;

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-white to-gray-50/30 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      
      <CardContent className="flex-1 pt-6">
        <div className="space-y-4">
          {/* Header with title and match score */}
          <div className="flex justify-between items-start gap-3">
            <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
              {title}
            </h3>
            {matchScore && (
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm whitespace-nowrap font-semibold">
                {matchScore}% Match
              </Badge>
            )}
          </div>
          
          {/* Industry Badge */}
          {industry && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
              <Building2 className="h-3 w-3 mr-1" />
              {industry}
            </Badge>
          )}
          
          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {truncateText(description, 160)}
          </p>
          
          {/* Career Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {displaySalary && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-100 hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Salary</span>
                </div>
                <p className="font-semibold text-green-800 text-sm">{displaySalary}</p>
              </div>
            )}
            
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 hover:bg-purple-100 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Mentors</span>
              </div>
              <p className="font-semibold text-purple-800 text-sm">
                {profiles_count} Available
              </p>
            </div>
          </div>
          
          {/* Education Requirements */}
          {required_education && required_education.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-medium text-gray-700">Education Required</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {required_education.slice(0, 2).map((edu, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors">
                    {edu}
                  </Badge>
                ))}
                {required_education.length > 2 && (
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                    +{required_education.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Key Skills */}
          {skillsToShow && skillsToShow.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium text-gray-700">Key Skills</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {skillsToShow.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors">
                    {skill}
                  </Badge>
                ))}
                {skillsToShow.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                    +{skillsToShow.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50/50 pt-4 pb-4">
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 font-medium" 
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
        >
          <span>Explore Career</span>
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </CardFooter>
    </Card>
  );
}

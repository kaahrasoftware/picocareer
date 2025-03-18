
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Briefcase, GraduationCap, Building2, TrendingUp, Users, Shuffle } from 'lucide-react';

export interface CareerCardProps {
  id: string;
  title: string;
  description: string;
  matchScore?: number;
  salary?: string;
  salary_range?: string;
  requiredSkills?: string[];
  education?: string[];
  onClick?: () => void;
  industry?: string;
  required_education?: string[];
  transferable_skills?: string[];
  profiles_count?: number;
}

export function CareerCard({
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

  // Use salary_range if provided, otherwise use salary
  const displaySalary = salary_range || salary;

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-muted/60 overflow-hidden group"
      onClick={onClick}
    >
      <CardContent className="flex-1 pt-6 relative">
        {/* Background hover effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          {/* Header with title and match score */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold leading-tight line-clamp-2">{title}</h3>
            {matchScore && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 font-medium ml-2 whitespace-nowrap">
                {matchScore}% Match
              </Badge>
            )}
          </div>
          
          {/* Industry Badge if available */}
          {industry && (
            <div className="mb-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 mb-3">
                <Building2 className="h-3 w-3" />
                {industry}
              </Badge>
            </div>
          )}
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {truncateText(description, 160)}
          </p>
          
          {/* Career Details Section */}
          <div className="space-y-3">
            {displaySalary && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">{displaySalary}</span>
              </div>
            )}
            
            {/* Number of Mentors */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span className="text-sm">{profiles_count} {profiles_count === 1 ? 'Mentor' : 'Mentors'}</span>
            </div>
            
            {/* Required Education */}
            {required_education && required_education.length > 0 && (
              <div className="flex items-start gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Required Education</p>
                  <div className="flex flex-wrap gap-1">
                    {required_education.slice(0, 2).map((edu, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700">
                        {edu}
                      </Badge>
                    ))}
                    {required_education.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{required_education.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Transferable Skills */}
            {transferable_skills && transferable_skills.length > 0 && (
              <div className="flex items-start gap-2">
                <Shuffle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Transferable Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {transferable_skills.slice(0, 2).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                        {skill}
                      </Badge>
                    ))}
                    {transferable_skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{transferable_skills.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Key Skills */}
            {requiredSkills && requiredSkills.length > 0 && (
              <div className="flex items-start gap-2">
                <Briefcase className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Key Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {requiredSkills.slice(0, 2).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                        {skill}
                      </Badge>
                    ))}
                    {requiredSkills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{requiredSkills.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 pb-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-1 group-hover:bg-primary/10 transition-colors" 
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
        >
          View Details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

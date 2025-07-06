
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, Briefcase, Building, Zap } from 'lucide-react';
import type { EnhancedSimilarCareer } from '@/hooks/useEnhancedSimilarCareers';

interface SimilarCareerHoverCardProps {
  career: EnhancedSimilarCareer;
  children: React.ReactNode;
}

export const SimilarCareerHoverCard = ({ career, children }: SimilarCareerHoverCardProps) => {
  const { match_details } = career;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4 space-y-3" side="top">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{career.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {career.description}
          </p>
        </div>

        <Separator />

        {/* Matched Skills */}
        {match_details.matchedSkills.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-600" />
              <span className="text-xs font-medium">Matched Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {match_details.matchedSkills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                  {skill}
                </Badge>
              ))}
              {match_details.matchedSkills.length > 5 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{match_details.matchedSkills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Role Compatibility */}
        {match_details.roleCompatibility && (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium">Role Compatibility</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {match_details.roleCompatibility}
            </p>
          </div>
        )}

        {/* Industry */}
        {match_details.industryMatch && (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium">Industry</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {match_details.industryMatch}
            </Badge>
          </div>
        )}

        {/* Education Requirements */}
        {match_details.educationRequirements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium">Education Requirements</span>
            </div>
            <div className="space-y-1">
              {match_details.educationRequirements.slice(0, 3).map((edu, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  • {edu}
                </div>
              ))}
              {match_details.educationRequirements.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  • +{match_details.educationRequirements.length - 3} more requirements
                </div>
              )}
            </div>
          </div>
        )}

        {career.salary_range && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Salary Range</span>
              <Badge className="bg-green-500 text-white text-xs">
                {career.salary_range}
              </Badge>
            </div>
          </>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

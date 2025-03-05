
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Star, TrendingUp, Users, Hammer, GraduationCap, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CareerMatchCardProps {
  career: string;
  score: number;
  description: string;
  details?: {
    salary_range?: string;
    required_skills?: string[];
    growth_potential?: string;
    work_environment?: string;
    required_education?: string[];
  };
  careerId?: string;
  onViewDetails?: (careerId: string) => void;
}

export function CareerMatchCard({ 
  career, 
  score, 
  description, 
  details,
  careerId,
  onViewDetails
}: CareerMatchCardProps) {
  return (
    <Card className="w-full bg-gradient-to-r from-white to-blue-50 border border-primary/20 shadow-sm hover:shadow-md transition-all mb-4 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg">{career}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-400" />
            <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
              {score}% Match
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 pt-0">
        <CardDescription className="text-sm text-muted-foreground mb-3">{description}</CardDescription>
        
        {details && (
          <div className="space-y-2 mt-3">
            {details.salary_range && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="bg-green-50/50">
                  <span className="mr-1">💰</span> Salary Range
                </Badge>
                <span className="font-medium">{details.salary_range}</span>
              </div>
            )}
            
            {details.growth_potential && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="bg-blue-50/50">
                  <TrendingUp className="h-3 w-3 mr-1" /> Growth
                </Badge>
                <span>{details.growth_potential}</span>
              </div>
            )}
            
            {details.work_environment && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="bg-purple-50/50">
                  <Users className="h-3 w-3 mr-1" /> Environment
                </Badge>
                <span>{details.work_environment}</span>
              </div>
            )}
            
            {details.required_skills && details.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="bg-amber-50/50">
                  <Hammer className="h-3 w-3 mr-1" /> Skills
                </Badge>
                {details.required_skills.slice(0, 3).map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {details.required_skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{details.required_skills.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            {details.required_education && details.required_education.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="bg-indigo-50/50">
                  <GraduationCap className="h-3 w-3 mr-1" /> Education
                </Badge>
                {details.required_education.slice(0, 2).map((edu, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {edu}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {careerId && onViewDetails && (
        <CardFooter className="pt-0 justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs" 
            onClick={() => onViewDetails(careerId)}
          >
            <ExternalLink className="h-3 w-3 mr-1" /> View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

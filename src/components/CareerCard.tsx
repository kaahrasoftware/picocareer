
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

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
  onClick
}: CareerCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Use salary_range if provided, otherwise use salary
  const displaySalary = salary_range || salary;

  const handleCardClick = () => {
    if (onClick) onClick();
  };

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="flex-1 pt-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {matchScore && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              {matchScore}% Match
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {truncateText(description, 150)}
        </p>
        
        {displaySalary && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Salary Range</p>
            <p className="text-sm font-medium">{displaySalary}</p>
          </div>
        )}
        
        {requiredSkills.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Key Skills</p>
            <div className="flex flex-wrap gap-1">
              {requiredSkills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {requiredSkills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{requiredSkills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {education.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Education</p>
            <div className="flex flex-wrap gap-1">
              {education.slice(0, 2).map((edu, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {edu}
                </Badge>
              ))}
              {education.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{education.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-1" 
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
          }}
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

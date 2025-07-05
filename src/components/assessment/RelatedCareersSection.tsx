
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRelatedCareers } from '@/hooks/useRelatedCareers';
import { Lightbulb, ExternalLink } from 'lucide-react';
import type { RelatedCareer } from '@/types/assessment';

interface RelatedCareersSectionProps {
  careerId: string;
  careerTitle: string;
  requiredSkills?: string[];
  industry?: string;
  onCareerSelect?: (careerId: string) => void;
}

export const RelatedCareersSection = ({ 
  careerId, 
  careerTitle, 
  requiredSkills = [], 
  industry,
  onCareerSelect 
}: RelatedCareersSectionProps) => {
  const { relatedCareers, isLoading, error } = useRelatedCareers(
    careerId, 
    careerTitle, 
    requiredSkills, 
    industry
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Loading Related Careers...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Related Careers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load related careers at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (relatedCareers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Related Careers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No related careers found at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Related Careers You Might Like
          <span className="text-sm font-normal text-muted-foreground">
            ({relatedCareers.length} found)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Based on your skills and interests, here are other careers worth exploring:
        </p>
        
        <div className="space-y-3">
          {relatedCareers.map((career) => (
            <div
              key={career.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="space-y-1">
                <h4 className="font-medium text-sm">{career.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {career.matchReason}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCareerSelect?.(career.id)}
              >
                View
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

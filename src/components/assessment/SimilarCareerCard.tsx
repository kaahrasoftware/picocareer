
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ExternalLink, TrendingUp } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Career = Tables<"careers">;

interface SimilarCareerCardProps {
  career: Career & { 
    similarity_score: number; 
    match_reasons: string[] 
  };
  onLearnMore: (careerId: string) => void;
}

export const SimilarCareerCard = ({ career, onLearnMore }: SimilarCareerCardProps) => {
  const matchPercentage = Math.round(career.similarity_score * 100);

  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="line-clamp-2">{career.title}</span>
          </CardTitle>
          <Badge variant="secondary" className="whitespace-nowrap">
            <TrendingUp className="h-3 w-3 mr-1" />
            {matchPercentage}% Match
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {career.description}
        </p>
        
        {career.salary_range && (
          <div className="text-sm">
            <span className="font-medium text-green-600">
              {career.salary_range}
            </span>
          </div>
        )}

        {career.match_reasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Why this matches:
            </p>
            <div className="flex flex-wrap gap-1">
              {career.match_reasons.slice(0, 3).map((reason, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onLearnMore(career.id)}
        >
          Learn More
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

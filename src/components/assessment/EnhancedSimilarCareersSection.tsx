
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Loader2, Briefcase, ExternalLink, TrendingUp } from 'lucide-react';
import { SimilarCareerHoverCard } from './SimilarCareerHoverCard';
import { useEnhancedSimilarCareers, type EnhancedSimilarCareer } from '@/hooks/useEnhancedSimilarCareers';

interface EnhancedSimilarCareersSectionProps {
  requiredSkills: string[];
  careerTitle: string;
  industry?: string;
  onCareerSelect: (careerId: string) => void;
}

export const EnhancedSimilarCareersSection = ({ 
  requiredSkills, 
  careerTitle, 
  industry, 
  onCareerSelect 
}: EnhancedSimilarCareersSectionProps) => {
  const { similarCareers, isLoading, error } = useEnhancedSimilarCareers(
    requiredSkills, 
    careerTitle, 
    industry
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Finding Similar Careers...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Analyzing career compatibility...
            </span>
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
            Similar Careers You Can Explore
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load similar careers at this time. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (similarCareers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Similar Careers You Can Explore
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We couldn't find similar careers in our database right now. 
            Check back later as we're constantly adding new career profiles.
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
          Similar Careers You Can Explore
          <span className="text-sm font-normal text-muted-foreground">
            ({similarCareers.length} found)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Since this specific career isn't in our database yet, here are similar careers you might be interested in. 
          Hover over each card to see detailed match information:
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {similarCareers.map((career) => (
            <EnhancedSimilarCareerCard
              key={career.id}
              career={career}
              onLearnMore={onCareerSelect}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface EnhancedSimilarCareerCardProps {
  career: EnhancedSimilarCareer;
  onLearnMore: (careerId: string) => void;
}

const EnhancedSimilarCareerCard = ({ career, onLearnMore }: EnhancedSimilarCareerCardProps) => {
  const matchPercentage = Math.round(career.similarity_score * 100);

  return (
    <SimilarCareerHoverCard career={career}>
      <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
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

          {/* Quick Preview of Match Details */}
          {career.match_details.matchedSkills.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Matched Skills Preview:
              </p>
              <div className="flex flex-wrap gap-1">
                {career.match_details.matchedSkills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {career.match_details.matchedSkills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{career.match_details.matchedSkills.length - 3} more
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground italic">
                Hover for complete details
              </p>
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
    </SimilarCareerHoverCard>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimilarCareerCard } from './SimilarCareerCard';
import { Lightbulb, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Career = Tables<"careers">;

interface SimilarCareersSectionProps {
  careers: (Career & { 
    similarity_score: number; 
    match_reasons: string[] 
  })[];
  isLoading: boolean;
  error?: string | null;
  onCareerSelect: (careerId: string) => void;
}

export const SimilarCareersSection = ({ 
  careers, 
  isLoading, 
  error, 
  onCareerSelect 
}: SimilarCareersSectionProps) => {
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
              Searching our database for similar careers...
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

  if (careers.length === 0) {
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
            ({careers.length} found)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Since this specific career isn't in our database yet, here are similar careers you might be interested in:
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {careers.map((career) => (
            <SimilarCareerCard
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

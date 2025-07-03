
import React from 'react';
import { Briefcase, Star } from 'lucide-react';

interface CareerRecommendationCardProps {
  career: string;
  score: number;
  description: string;
}

export function CareerRecommendationCard({ career, score, description }: CareerRecommendationCardProps) {
  return (
    <div className="bg-gradient-to-r from-white to-blue-50 border border-primary/20 p-4 rounded-lg shadow-sm transition-all hover:shadow-md mb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
          <h4 className="font-medium text-lg">{career}</h4>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-amber-400" />
          <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
            {score}% Match
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

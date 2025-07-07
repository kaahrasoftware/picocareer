
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Briefcase } from 'lucide-react';
import type { CareerRecommendation } from '@/types/assessment';

interface CareerOverviewHeroProps {
  recommendation: CareerRecommendation;
  onBack: () => void;
}

export const CareerOverviewHero = ({ recommendation, onBack }: CareerOverviewHeroProps) => {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-xl p-8 mb-6 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full transform -translate-x-12 translate-y-12" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={onBack} 
            variant="outline" 
            size="sm"
            className="bg-white/80 hover:bg-white border-blue-200 text-blue-700 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {recommendation.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3">
              {recommendation.industry && (
                <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700 px-3 py-1">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {recommendation.industry}
                </Badge>
              )}
            </div>
          </div>

          {/* Match Score - Prominent Display */}
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">Match Score</span>
              </div>
              <div className="text-4xl font-bold mb-1">
                {recommendation.matchScore}%
              </div>
              <div className="text-sm opacity-90">Perfect Match!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

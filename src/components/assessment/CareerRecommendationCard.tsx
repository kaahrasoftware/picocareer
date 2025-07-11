
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CareerRecommendation } from '@/types/assessment';
import { CareerDetailsDialog } from '@/components/CareerDetailsDialog';
import { FindMentorsDialog } from './FindMentorsDialog';
import { RelatedCareersSection } from './RelatedCareersSection';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Clock,
  ExternalLink,
  Bookmark,
  Users
} from 'lucide-react';

interface CareerRecommendationCardProps {
  recommendation: CareerRecommendation;
  rank: number;
}

export const CareerRecommendationCard = ({ 
  recommendation, 
  rank 
}: CareerRecommendationCardProps) => {
  const { isMobile } = useBreakpoints();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mentorsDialogOpen, setMentorsDialogOpen] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');

  const handleViewCareer = () => {
    setSelectedCareerId(recommendation.careerId || '');
    setDialogOpen(true);
  };

  const handleBookmark = () => {
    // Implementation for bookmarking career
    console.log('Bookmarking career:', recommendation.careerId);
  };

  const handleFindMentors = () => {
    setMentorsDialogOpen(true);
  };

  const handleRelatedCareerSelect = (careerId: string) => {
    setSelectedCareerId(careerId);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className={isMobile ? 'pb-4' : ''}>
          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-start'}`}>
            <div className={`flex items-start ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
              <div className="flex-shrink-0">
                <div className={`${isMobile ? 'w-6 h-6 text-sm' : 'w-8 h-8'} bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold`}>
                  {rank}
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
                  <Briefcase className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  {recommendation.title}
                </CardTitle>
                <div className={`flex items-center gap-2 ${isMobile ? 'mt-1' : 'mt-2'}`}>
                  <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>
                    {Math.round(recommendation.matchScore)}% Match
                  </Badge>
                  <Progress 
                    value={recommendation.matchScore} 
                    className={`${isMobile ? 'w-16 h-1.5' : 'w-20 h-2'}`}
                  />
                </div>
              </div>
            </div>
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={handleBookmark}>
                <Bookmark className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>{recommendation.description}</p>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'md:grid-cols-3 gap-4'} text-sm`}>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>{recommendation.salaryRange || 'Varies'}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>{recommendation.growthOutlook || 'Stable'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>{recommendation.timeToEntry || 'Varies'}</span>
            </div>
          </div>

          <div>
            <h4 className={`font-semibold ${isMobile ? 'mb-1 text-sm' : 'mb-2'}`}>Why This Matches You:</h4>
            <p className="text-sm text-muted-foreground">
              {recommendation.reasoning}
            </p>
          </div>

          {recommendation.requiredSkills && recommendation.requiredSkills.length > 0 && (
            <div>
              <h4 className={`font-semibold ${isMobile ? 'mb-1 text-sm' : 'mb-2'}`}>Key Skills Needed:</h4>
              <div className="flex flex-wrap gap-1">
                {recommendation.requiredSkills.slice(0, isMobile ? 4 : 6).map((skill, index) => (
                  <Badge key={index} variant="outline" className={`${isMobile ? 'text-xs px-2 py-0.5' : 'text-xs'}`}>
                    {skill}
                  </Badge>
                ))}
                {isMobile && recommendation.requiredSkills.length > 4 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{recommendation.requiredSkills.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'} ${isMobile ? 'pt-1' : 'pt-2'}`}>
            <Button 
              onClick={handleViewCareer} 
              size={isMobile ? "default" : "sm"}
              className={isMobile ? 'w-full min-h-[44px]' : ''}
            >
              Learn More
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "sm"} 
              onClick={handleFindMentors}
              className={isMobile ? 'w-full min-h-[44px]' : ''}
            >
              <Users className="h-3 w-3 mr-1" />
              Find Mentors
            </Button>
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={handleBookmark} className="self-start">
                <Bookmark className="h-4 w-4 mr-1" />
                Bookmark
              </Button>
            )}
          </div>

          {/* Related Careers Section - Hide on mobile to reduce clutter */}
          {!isMobile && (
            <div className="mt-6">
              <RelatedCareersSection
                recommendation={recommendation}
                onCareerSelect={handleRelatedCareerSelect}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <CareerDetailsDialog
        careerId={selectedCareerId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        recommendationData={recommendation}
      />

      <FindMentorsDialog
        open={mentorsDialogOpen}
        onOpenChange={setMentorsDialogOpen}
        recommendation={recommendation}
      />
    </>
  );
};

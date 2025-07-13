
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
      <Card 
        className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
        data-career-id={recommendation.careerId}
        id={`career-card-${recommendation.careerId}`}
      >
        <CardHeader className={`bg-gradient-to-r from-primary/5 to-secondary/5 ${isMobile ? 'pb-6 px-6' : 'pb-8 px-8'}`}>
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-start'}`}>
            <div className={`flex items-start ${isMobile ? 'space-x-4' : 'space-x-4'}`}>
              <div className="flex-shrink-0">
                <div className={`${isMobile ? 'w-12 h-12 text-lg' : 'w-14 h-14 text-xl'} bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center font-bold shadow-lg`}>
                  {rank}
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <CardTitle className={`flex items-start gap-3 ${isMobile ? 'text-xl' : 'text-2xl'} font-bold leading-tight`}>
                  <Briefcase className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} text-primary mt-1`} />
                  <span className="flex-1">{recommendation.title}</span>
                </CardTitle>
                <div className={`flex items-center gap-3 ${isMobile ? 'mt-2' : 'mt-3'}`}>
                  <Badge variant="secondary" className={`${isMobile ? 'text-sm px-3 py-1' : 'text-base px-4 py-2'} bg-primary/10 text-primary font-semibold`}>
                    {Math.round(recommendation.matchScore)}% Match
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <Progress 
                      value={recommendation.matchScore} 
                      className={`${isMobile ? 'h-2' : 'h-3'} bg-primary/10`}
                    />
                    <p className="text-xs text-muted-foreground">Match confidence</p>
                  </div>
                </div>
              </div>
            </div>
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={handleBookmark} className="hover:bg-primary/10">
                <Bookmark className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className={`${isMobile ? 'space-y-6 px-6 pb-8' : 'space-y-8 px-8 pb-10'}`}>
          <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-lg'} leading-relaxed`}>
            {recommendation.description}
          </p>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-3 gap-6'}`}>
            <div className={`flex items-center gap-3 ${isMobile ? 'p-3 bg-green-50 rounded-lg' : 'p-4 bg-green-50 rounded-xl'}`}>
              <DollarSign className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} text-green-600`} />
              <div>
                <p className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} text-green-800`}>Salary Range</p>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-green-700`}>{recommendation.salaryRange || 'Varies'}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${isMobile ? 'p-3 bg-blue-50 rounded-lg' : 'p-4 bg-blue-50 rounded-xl'}`}>
              <TrendingUp className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} text-blue-600`} />
              <div>
                <p className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} text-blue-800`}>Growth Outlook</p>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-blue-700`}>{recommendation.growthOutlook || 'Stable'}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${isMobile ? 'p-3 bg-orange-50 rounded-lg' : 'p-4 bg-orange-50 rounded-xl'}`}>
              <Clock className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} text-orange-600`} />
              <div>
                <p className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} text-orange-800`}>Time to Entry</p>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-orange-700`}>{recommendation.timeToEntry || 'Varies'}</p>
              </div>
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

          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'gap-3'} ${isMobile ? 'pt-4' : 'pt-6'}`}>
            <Button 
              onClick={handleViewCareer} 
              size="lg"
              className={`${isMobile ? 'w-full min-h-[52px] text-base' : 'flex-1 min-h-[48px]'} bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-medium`}
            >
              Learn More About This Career
              <ExternalLink className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleFindMentors}
              className={`${isMobile ? 'w-full min-h-[52px] text-base' : 'flex-1 min-h-[48px]'} border-2 hover:border-primary/40 transition-all duration-200 font-medium`}
            >
              <Users className="h-5 w-5 mr-2" />
              Find Mentors
            </Button>
            {isMobile && (
              <Button variant="ghost" size="lg" onClick={handleBookmark} className="justify-start hover:bg-primary/10">
                <Bookmark className="h-5 w-5 mr-2" />
                Bookmark This Career
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

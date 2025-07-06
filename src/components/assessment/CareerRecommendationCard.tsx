
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CareerRecommendation } from '@/types/assessment';
import { CareerDetailsDialog } from '@/components/CareerDetailsDialog';
import { FindMentorsDialog } from './FindMentorsDialog';
import { RelatedCareersSection } from './RelatedCareersSection';
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
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  {rank}
                </div>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {recommendation.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {Math.round(recommendation.matchScore)}% Match
                  </Badge>
                  <Progress 
                    value={recommendation.matchScore} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleBookmark}>
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{recommendation.description}</p>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
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
            <h4 className="font-semibold mb-2">Why This Matches You:</h4>
            <p className="text-sm text-muted-foreground">
              {recommendation.reasoning}
            </p>
          </div>

          {recommendation.requiredSkills && recommendation.requiredSkills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Key Skills Needed:</h4>
              <div className="flex flex-wrap gap-1">
                {recommendation.requiredSkills.slice(0, 6).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleViewCareer} size="sm">
              Learn More
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleFindMentors}>
              <Users className="h-3 w-3 mr-1" />
              Find Mentors
            </Button>
          </div>

          {/* Related Careers Section */}
          <div className="mt-6">
            <RelatedCareersSection
              recommendation={recommendation}
              onCareerSelect={handleRelatedCareerSelect}
            />
          </div>
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

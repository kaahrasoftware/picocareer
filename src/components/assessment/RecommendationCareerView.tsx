import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Briefcase, TrendingUp, Clock, GraduationCap, MapPin, Users } from 'lucide-react';
import { FindMentorsDialog } from './FindMentorsDialog';
import { RelatedCareersSection } from './RelatedCareersSection';
import { useNavigate } from 'react-router-dom';
import { useRelatedCareers } from '@/hooks/useRelatedCareers';
import type { CareerRecommendation } from '@/types/assessment';
interface RecommendationCareerViewProps {
  recommendation: CareerRecommendation;
  onBack: () => void;
}
export const RecommendationCareerView = ({
  recommendation,
  onBack
}: RecommendationCareerViewProps) => {
  const navigate = useNavigate();
  const [showFindMentors, setShowFindMentors] = useState(false);
  const {
    relatedCareers,
    isLoading: relatedLoading
  } = useRelatedCareers('',
  // No specific career ID for AI recommendations  
  recommendation.title, recommendation.requiredSkills || [], recommendation.industry);
  const handleCareerSelect = (careerId: string) => {
    navigate(`/careers/${careerId}`);
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{recommendation.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-green-500 text-white">
              <TrendingUp className="h-3 w-3 mr-1" />
              {recommendation.matchScore}% Match
            </Badge>
            {recommendation.industry && <Badge variant="outline">
                <Briefcase className="h-3 w-3 mr-1" />
                {recommendation.industry}
              </Badge>}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Career Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {recommendation.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {recommendation.salaryRange && <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                    <div className="text-sm font-medium text-green-700 dark:text-green-400">
                      Salary Range
                    </div>
                    <div className="text-lg font-semibold text-green-800 dark:text-green-300">
                      {recommendation.salaryRange}
                    </div>
                  </div>}
                
                {recommendation.timeToEntry && <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Time to Entry
                    </div>
                    <div className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                      {recommendation.timeToEntry}
                    </div>
                  </div>}
              </div>
            </CardContent>
          </Card>

          {/* Why This Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Why This Career Matches You</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {recommendation.reasoning}
              </p>
            </CardContent>
          </Card>

          {/* Skills Required */}
          {recommendation.requiredSkills && recommendation.requiredSkills.length > 0 && <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recommendation.requiredSkills.map((skill, index) => <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>)}
                </div>
              </CardContent>
            </Card>}

          {/* Education Requirements */}
          {recommendation.educationRequirements && recommendation.educationRequirements.length > 0 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendation.educationRequirements.map((req, index) => <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>)}
                </ul>
              </CardContent>
            </Card>}

          {/* Work Environment */}
          {recommendation.workEnvironment && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Work Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {recommendation.workEnvironment}
                </p>
              </CardContent>
            </Card>}

          {/* Growth Outlook */}
          {recommendation.growthOutlook && <Card>
              <CardHeader>
                <CardTitle>Growth Outlook</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {recommendation.growthOutlook}
                </p>
              </CardContent>
            </Card>}
        </div>

        {/* Right Column - Actions & Related */}
        
      </div>

      {/* Find Mentors Dialog */}
      <FindMentorsDialog open={showFindMentors} onOpenChange={setShowFindMentors} recommendation={recommendation} />
    </div>;
};
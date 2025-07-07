
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, MapPin, Target, Lightbulb, Users } from 'lucide-react';
import { CareerOverviewHero } from './CareerOverviewHero';
import { CareerMetricsCards } from './CareerMetricsCards';
import { ModernContentCard } from './ModernContentCard';
import { ModernSkillsSection } from './ModernSkillsSection';
import { ModernSimilarCareersSection } from './ModernSimilarCareersSection';
import { FindMentorsDialog } from './FindMentorsDialog';
import { CareerDetailsDialog } from '@/components/CareerDetailsDialog';
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
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [careerDialogOpen, setCareerDialogOpen] = useState(false);
  
  const {
    relatedCareers,
    isLoading: relatedLoading
  } = useRelatedCareers('',
    recommendation.title, 
    recommendation.requiredSkills || [], 
    recommendation.industry
  );

  const handleCareerSelect = (careerId: string) => {
    setSelectedCareerId(careerId);
    setCareerDialogOpen(true);
  };

  const handleCareerDialogClose = () => {
    setCareerDialogOpen(false);
    setSelectedCareerId(null);
  };

  return (
    <div className="space-y-6">
      {/* Modern Hero Header */}
      <CareerOverviewHero 
        recommendation={recommendation} 
        onBack={onBack} 
      />

      {/* Modern Metrics Cards */}
      <CareerMetricsCards recommendation={recommendation} />

      {/* Main Content Grid */}
      <div className="grid gap-6">
        {/* Career Overview */}
        <ModernContentCard 
          title="Career Overview" 
          icon={<Target className="h-5 w-5 text-indigo-600" />}
          variant="default"
        >
          <p className="text-gray-700 leading-relaxed">
            {recommendation.description}
          </p>
        </ModernContentCard>

        {/* Why This Matches */}
        <ModernContentCard 
          title="Why This Career Matches You" 
          icon={<Lightbulb className="h-5 w-5 text-amber-600" />}
          variant="highlighted"
        >
          <p className="text-gray-700 leading-relaxed">
            {recommendation.reasoning}
          </p>
        </ModernContentCard>

        {/* Skills Required */}
        {recommendation.requiredSkills && recommendation.requiredSkills.length > 0 && (
          <ModernSkillsSection 
            skills={recommendation.requiredSkills}
            title="Required Skills"
          />
        )}

        {/* Education Requirements */}
        {recommendation.educationRequirements && recommendation.educationRequirements.length > 0 && (
          <ModernContentCard 
            title="Education Requirements" 
            icon={<GraduationCap className="h-5 w-5 text-green-600" />}
            variant="gradient"
          >
            <ul className="space-y-3">
              {recommendation.educationRequirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="text-gray-700 leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </ModernContentCard>
        )}

        {/* Work Environment */}
        {recommendation.workEnvironment && (
          <ModernContentCard 
            title="Work Environment" 
            icon={<MapPin className="h-5 w-5 text-purple-600" />}
            variant="default"
          >
            <p className="text-gray-700 leading-relaxed">
              {recommendation.workEnvironment}
            </p>
          </ModernContentCard>
        )}

        {/* Growth Outlook - Full Details */}
        {recommendation.growthOutlook && (
          <ModernContentCard 
            title="Growth Outlook" 
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            variant="gradient"
          >
            <p className="text-gray-700 leading-relaxed">
              {recommendation.growthOutlook}
            </p>
          </ModernContentCard>
        )}

        {/* Similar Careers Section - NEW */}
        <ModernSimilarCareersSection 
          recommendation={recommendation}
          onCareerSelect={handleCareerSelect}
        />
      </div>

      {/* Find Mentors Dialog */}
      <FindMentorsDialog 
        open={showFindMentors} 
        onOpenChange={setShowFindMentors} 
        recommendation={recommendation} 
      />

      {/* Career Details Dialog */}
      {selectedCareerId && (
        <CareerDetailsDialog
          careerId={selectedCareerId}
          open={careerDialogOpen}
          onOpenChange={handleCareerDialogClose}
        />
      )}
    </div>
  );
};

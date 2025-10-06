import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PathwayTier } from '@/types/database/pathways';

interface AssessmentProgressIndicatorProps {
  currentTier: PathwayTier;
  progress: number;
  selectedPathwaysCount?: number;
  selectedClustersCount?: number;
  detectedProfileType?: string | null;
  isMobile?: boolean;
}

const tierConfig = {
  profile_detection: {
    label: 'Profile',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  career_choice: {
    label: 'Career Pathways',
    icon: Target,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  subject_cluster: {
    label: 'Subject Areas',
    icon: BookOpen,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/20',
  },
  refinement: {
    label: 'Refinement',
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  practical: {
    label: 'Practical Details',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
};

export const AssessmentProgressIndicator = ({
  currentTier,
  progress,
  selectedPathwaysCount = 0,
  selectedClustersCount = 0,
  detectedProfileType,
  isMobile = false,
}: AssessmentProgressIndicatorProps) => {
  const tiers: PathwayTier[] = ['profile_detection', 'career_choice', 'subject_cluster', 'refinement', 'practical'];
  const currentTierIndex = tiers.indexOf(currentTier);

  const CurrentTierIcon = tierConfig[currentTier].icon;

  if (isMobile) {
    // Mobile: Compact horizontal breadcrumb
    return (
      <div className="space-y-3">
        {/* Current tier badge */}
        <div className="flex items-center justify-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm py-2 px-4",
              tierConfig[currentTier].color,
              tierConfig[currentTier].bgColor,
              tierConfig[currentTier].borderColor
            )}
          >
            <CurrentTierIcon className="h-4 w-4 mr-2" />
            {tierConfig[currentTier].label}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}% Complete</span>
            {selectedPathwaysCount > 0 && (
              <span>{selectedPathwaysCount} pathways selected</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Full visualization
  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            tierConfig[currentTier].bgColor
          )}>
            <CurrentTierIcon className={cn("h-6 w-6", tierConfig[currentTier].color)} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {tierConfig[currentTier].label}
            </h3>
            <p className="text-sm text-muted-foreground">
              Step {currentTierIndex + 1} of {tiers.length}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {Math.round(progress)}%
          </div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-3" />

      {/* Tier breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        {tiers.map((tier, index) => {
          const config = tierConfig[tier];
          const TierIcon = config.icon;
          const isCompleted = index < currentTierIndex;
          const isCurrent = index === currentTierIndex;
          
          return (
            <React.Fragment key={tier}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isCompleted && "bg-green-100 text-green-600",
                    isCurrent && cn(config.bgColor, config.color),
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <TierIcon className="h-5 w-5" />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium text-center",
                  isCurrent ? config.color : "text-muted-foreground"
                )}>
                  {config.label}
                </span>
              </div>
              {index < tiers.length - 1 && (
                <div 
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    isCompleted ? "bg-green-300" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selection summary */}
      {(selectedPathwaysCount > 0 || selectedClustersCount > 0 || detectedProfileType) && (
        <div className="pt-4 border-t space-y-2">
          {detectedProfileType && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profile Type:</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {detectedProfileType.replace('_', ' ')}
              </Badge>
            </div>
          )}
          {selectedPathwaysCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Career Pathways:</span>
              <span className="font-medium text-foreground">{selectedPathwaysCount} selected</span>
            </div>
          )}
          {selectedClustersCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subject Areas:</span>
              <span className="font-medium text-foreground">{selectedClustersCount} selected</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

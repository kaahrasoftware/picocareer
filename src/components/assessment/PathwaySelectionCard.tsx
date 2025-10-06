import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CareerPathway } from '@/types/database/pathways';

interface PathwaySelectionCardProps {
  pathway: CareerPathway;
  isSelected: boolean;
  onSelect: (pathwayId: string) => void;
  maxSelections?: number;
  currentSelectionCount: number;
}

export const PathwaySelectionCard = ({
  pathway,
  isSelected,
  onSelect,
  maxSelections = 3,
  currentSelectionCount,
}: PathwaySelectionCardProps) => {
  const canSelect = isSelected || currentSelectionCount < maxSelections;

  const handleClick = () => {
    if (canSelect) {
      onSelect(pathway.id);
    }
  };

  // Convert hex color to HSL for background
  const getPathwayStyles = () => {
    const baseStyles = "relative overflow-hidden transition-all duration-300";
    
    if (isSelected) {
      return `${baseStyles} border-2 border-primary shadow-lg scale-[1.02]`;
    }
    
    if (!canSelect) {
      return `${baseStyles} opacity-50 cursor-not-allowed`;
    }
    
    return `${baseStyles} border-2 border-transparent hover:border-primary/30 hover:shadow-md hover:scale-[1.01] cursor-pointer`;
  };

  return (
    <Card 
      className={cn(getPathwayStyles())}
      onClick={handleClick}
    >
      <CardContent className="p-6 space-y-4">
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-200">
            <Check className="h-5 w-5 text-primary-foreground" />
          </div>
        )}

        {/* Icon */}
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
          style={{
            backgroundColor: `${pathway.color}15`,
            color: pathway.color,
          }}
        >
          {pathway.icon || '🎯'}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {pathway.title}
          </h3>
          
          {/* Description */}
          {pathway.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {pathway.description}
            </p>
          )}
        </div>

        {/* Selection helper */}
        {!isSelected && !canSelect && (
          <p className="text-xs text-destructive">
            Maximum {maxSelections} selections reached
          </p>
        )}
      </CardContent>
    </Card>
  );
};

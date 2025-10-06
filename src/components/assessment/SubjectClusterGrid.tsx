import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubjectCluster } from '@/types/database/pathways';
import type { CareerPathway } from '@/types/database/pathways';

interface SubjectClusterWithPathway extends SubjectCluster {
  pathway: CareerPathway;
}

interface SubjectClusterGridProps {
  clusters: SubjectClusterWithPathway[];
  selectedClusterIds: string[];
  onSelectCluster: (clusterId: string) => void;
  recommendedClusterIds?: string[];
  maxSelections?: number;
}

export const SubjectClusterGrid = ({
  clusters,
  selectedClusterIds,
  onSelectCluster,
  recommendedClusterIds = [],
  maxSelections = 5,
}: SubjectClusterGridProps) => {
  const canSelect = (clusterId: string) => {
    return selectedClusterIds.includes(clusterId) || selectedClusterIds.length < maxSelections;
  };

  // Group clusters by pathway
  const groupedClusters = clusters.reduce((acc, cluster) => {
    const pathwayId = cluster.pathway_id;
    if (!acc[pathwayId]) {
      acc[pathwayId] = {
        pathway: cluster.pathway,
        clusters: [],
      };
    }
    acc[pathwayId].clusters.push(cluster);
    return acc;
  }, {} as Record<string, { pathway: CareerPathway; clusters: SubjectClusterWithPathway[] }>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedClusters).map(([pathwayId, { pathway, clusters: pathwayClusters }]) => (
        <div key={pathwayId} className="space-y-4">
          {/* Pathway header */}
          <div 
            className="flex items-center gap-3 pb-3 border-b-2"
            style={{ borderColor: `${pathway.color}40` }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{
                backgroundColor: `${pathway.color}15`,
                color: pathway.color,
              }}
            >
              {pathway.icon || '🎯'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {pathway.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {pathwayClusters.length} subject areas
              </p>
            </div>
          </div>

          {/* Cluster cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pathwayClusters.map((cluster) => {
              const isSelected = selectedClusterIds.includes(cluster.id);
              const isRecommended = recommendedClusterIds.includes(cluster.id);
              const canSelectThis = canSelect(cluster.id);

              return (
                <Card
                  key={cluster.id}
                  className={cn(
                    "relative cursor-pointer transition-all duration-200",
                    isSelected && "border-2 shadow-md scale-[1.02]",
                    !isSelected && canSelectThis && "border hover:border-primary/30 hover:shadow-sm hover:scale-[1.01]",
                    !canSelectThis && "opacity-50 cursor-not-allowed"
                  )}
                  style={{
                    borderLeftWidth: isSelected ? '4px' : '2px',
                    borderLeftColor: isSelected ? pathway.color : 'transparent',
                  }}
                  onClick={() => canSelectThis && onSelectCluster(cluster.id)}
                >
                  <CardContent className="p-4 space-y-2">
                    {/* Selection indicator & Recommended badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      {isRecommended && !isSelected && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-primary/10 text-primary border-primary/20"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                      
                      {isSelected && (
                        <div 
                          className="ml-auto w-6 h-6 rounded-full flex items-center justify-center animate-in zoom-in duration-200"
                          style={{ backgroundColor: pathway.color }}
                        >
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="font-medium text-foreground leading-snug">
                      {cluster.title}
                    </h4>

                    {/* Description */}
                    {cluster.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {cluster.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selection counter */}
      <div className="text-center text-sm text-muted-foreground">
        Selected {selectedClusterIds.length} of {maxSelections} subject areas
      </div>
    </div>
  );
};

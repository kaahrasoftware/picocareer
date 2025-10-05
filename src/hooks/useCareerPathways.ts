import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CareerPathway, SubjectCluster } from '@/types/database/pathways';

export function useCareerPathways() {
  return useQuery({
    queryKey: ['career-pathways'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('career_pathways')
        .select('*')
        .order('order_index');

      if (error) throw error;
      return data as CareerPathway[];
    },
  });
}

export function useSubjectClusters(pathwayId?: string) {
  return useQuery({
    queryKey: ['subject-clusters', pathwayId],
    queryFn: async () => {
      let query = supabase
        .from('subject_clusters')
        .select('*')
        .order('order_index');

      if (pathwayId) {
        query = query.eq('pathway_id', pathwayId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SubjectCluster[];
    },
    enabled: pathwayId ? true : undefined,
  });
}

export function useAllSubjectClusters() {
  return useQuery({
    queryKey: ['all-subject-clusters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subject_clusters')
        .select(`
          *,
          pathway:career_pathways(id, title, color, icon)
        `)
        .order('pathway_id')
        .order('order_index');

      if (error) throw error;
      return data as (SubjectCluster & { pathway: CareerPathway })[];
    },
  });
}

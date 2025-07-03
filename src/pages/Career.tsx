
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { useState } from "react";

export default function Career() {
  const { id } = useParams<{ id: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const { data: career, isLoading, error } = useQuery({
    queryKey: ['career', id],
    queryFn: async () => {
      if (!id) throw new Error('Career ID is required');
      
      const { data, error } = await supabase
        .from('careers')
        .select(`
          *,
          career_major_relations(
            relevance_score,
            major:majors(
              id,
              title,
              description
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching career:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading career details...</div>
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          {error instanceof Error ? error.message : 'Career not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CareerDetailsDialog
        careerId={career.id}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            // Navigate back when dialog closes
            window.history.back();
          }
        }}
      />
    </div>
  );
}

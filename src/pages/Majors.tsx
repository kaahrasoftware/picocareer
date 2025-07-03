
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MajorCard } from '@/components/MajorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Majors() {
  const { data: majors, isLoading, error } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Error loading majors. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Academic Majors</h1>
        <p className="text-muted-foreground">
          Explore different academic majors and find the one that's right for you.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {majors?.map((major) => (
          <MajorCard 
            key={major.id} 
            id={major.id}
            title={major.title}
            description={major.description}
            potential_salary={major.potential_salary}
            skill_match={major.skill_match}
            tools_knowledge={major.tools_knowledge}
            common_courses={major.common_courses}
            profiles_count={major.profiles_count}
            degree_levels={major.degree_levels}
            learning_objectives={major.learning_objectives}
            interdisciplinary_connections={major.interdisciplinary_connections}
            job_prospects={major.job_prospects}
            certifications_to_consider={major.certifications_to_consider}
            affiliated_programs={major.affiliated_programs}
            gpa_expectations={major.gpa_expectations}
            transferable_skills={major.transferable_skills}
            passion_for_subject={major.passion_for_subject}
            professional_associations={major.professional_associations}
            global_applicability={major.global_applicability}
            common_difficulties={major.common_difficulties}
            career_opportunities={major.career_opportunities}
            intensity={major.intensity}
            stress_level={major.stress_level}
            dropout_rates={major.dropout_rates}
            majors_to_consider_switching_to={major.majors_to_consider_switching_to}
          />
        ))}
      </div>
    </div>
  );
}

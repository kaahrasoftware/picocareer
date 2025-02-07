
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { CareerRecommendation, MajorRecommendation } from './types.ts';

export async function getRecommendations(
  supabaseClient: ReturnType<typeof createClient>,
  careerIds: string[],
  majorIds: string[],
  careerScores: any,
  majorScores: any
): Promise<{
  careerRecommendations: CareerRecommendation[];
  majorRecommendations: MajorRecommendation[];
}> {
  // Get career details
  const { data: careers, error: careersError } = await supabaseClient
    .from('careers')
    .select('id, title, description')
    .in('id', careerIds);

  if (careersError) throw careersError;

  // Get major details
  const { data: majors, error: majorsError } = await supabaseClient
    .from('majors')
    .select('id, title, description')
    .in('id', majorIds);

  if (majorsError) throw majorsError;

  // Format career recommendations
  const careerRecommendations = careers
    .map(career => ({
      id: career.id,
      title: career.title,
      description: career.description,
      score: careerScores[career.id].score,
      reasoning: Array.from(careerScores[career.id].reasons).join('. ')
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Format major recommendations
  const majorRecommendations = majors
    .map(major => ({
      id: major.id,
      title: major.title,
      description: major.description,
      score: majorScores[major.id].score,
      reasoning: Array.from(majorScores[major.id].reasons).join('. ')
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return { careerRecommendations, majorRecommendations };
}



import { DimensionScores } from './types.ts';

export async function calculateDimensionScores(
  responses: { [key: string]: string },
  supabaseClient: any
): Promise<DimensionScores> {
  // Get answer weights from database
  const { data: weights, error } = await supabaseClient
    .from('personality_answer_weights')
    .select('*');

  if (error) throw error;

  // Initialize scores
  let scores = {
    e_i_score: 0,
    s_n_score: 0,
    t_f_score: 0,
    j_p_score: 0,
    e_i_responses: 0,
    s_n_responses: 0,
    t_f_responses: 0,
    j_p_responses: 0,
    confidence_level: 0
  };

  // Process each response
  for (const [questionId, answer] of Object.entries(responses)) {
    const answerWeights = weights.filter(w => 
      w.question_id === questionId && 
      w.answer_value === String(answer)
    );

    for (const weight of answerWeights) {
      switch (weight.dimension) {
        case 'E':
          scores.e_i_score += weight.weight;
          scores.e_i_responses++;
          break;
        case 'I':
          scores.e_i_score -= weight.weight;
          scores.e_i_responses++;
          break;
        case 'S':
          scores.s_n_score += weight.weight;
          scores.s_n_responses++;
          break;
        case 'N':
          scores.s_n_score -= weight.weight;
          scores.s_n_responses++;
          break;
        case 'T':
          scores.t_f_score += weight.weight;
          scores.t_f_responses++;
          break;
        case 'F':
          scores.t_f_score -= weight.weight;
          scores.t_f_responses++;
          break;
        case 'J':
          scores.j_p_score += weight.weight;
          scores.j_p_responses++;
          break;
        case 'P':
          scores.j_p_score -= weight.weight;
          scores.j_p_responses++;
          break;
      }
    }
  }

  // Calculate confidence level based on number of responses
  const totalPossibleResponses = 32; // Total number of scored questions
  const totalResponses = scores.e_i_responses + scores.s_n_responses + 
                        scores.t_f_responses + scores.j_p_responses;
  scores.confidence_level = totalResponses / totalPossibleResponses;

  return scores;
}

export function getPersonalityType(scores: DimensionScores): string {
  return (
    (scores.e_i_score >= 0 ? 'E' : 'I') +
    (scores.s_n_score >= 0 ? 'S' : 'N') +
    (scores.t_f_score >= 0 ? 'T' : 'F') +
    (scores.j_p_score >= 0 ? 'J' : 'P')
  );
}

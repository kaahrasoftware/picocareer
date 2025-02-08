
import { DimensionScores } from './types.ts';

export async function calculateDimensionScores(
  responses: { [key: string]: string },
  supabaseClient: any
): Promise<DimensionScores> {
  // Get answer weights from database
  const { data: weights, error } = await supabaseClient
    .from('personality_answer_weights')
    .select('*');

  if (error) {
    console.error('Error fetching weights:', error);
    throw error;
  }

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
    console.log(`Processing answer for question ${questionId}: ${answer}`);
    
    const answerWeights = weights.filter(w => 
      w.question_id === questionId && 
      w.answer_value === String(answer)
    );

    console.log(`Found ${answerWeights.length} weights for this answer`);

    for (const weight of answerWeights) {
      console.log(`Processing weight for dimension ${weight.dimension}: ${weight.weight}`);
      
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
  const totalResponses = Math.max(
    scores.e_i_responses,
    scores.s_n_responses,
    scores.t_f_responses,
    scores.j_p_responses
  );
  scores.confidence_level = totalResponses / totalPossibleResponses;

  console.log('Final dimension scores:', scores);

  return scores;
}

export function getPersonalityType(scores: DimensionScores): string[] {
  console.log('Calculating personality types from scores:', scores);
  
  const margin = 3; // Increased margin to catch more potential alternates
  const types: string[] = [];
  
  // Calculate primary type
  const primaryType = 
    (scores.e_i_score >= 0 ? 'E' : 'I') +
    (scores.s_n_score >= 0 ? 'S' : 'N') +
    (scores.t_f_score >= 0 ? 'T' : 'F') +
    (scores.j_p_score >= 0 ? 'J' : 'P');
  
  types.push(primaryType);
  
  // Calculate alternate types based on close scores
  const closeToZero = {
    ei: Math.abs(scores.e_i_score) <= margin,
    sn: Math.abs(scores.s_n_score) <= margin,
    tf: Math.abs(scores.t_f_score) <= margin,
    jp: Math.abs(scores.j_p_score) <= margin
  };
  
  // Generate alternate types for scores close to zero
  if (closeToZero.ei) {
    types.push(
      ('I' + primaryType.slice(1)),
      ('E' + primaryType.slice(1))
    );
  }
  if (closeToZero.sn) {
    types.push(
      (primaryType[0] + 'N' + primaryType.slice(2)),
      (primaryType[0] + 'S' + primaryType.slice(2))
    );
  }
  if (closeToZero.tf) {
    types.push(
      (primaryType.slice(0, 2) + 'F' + primaryType.slice(3)),
      (primaryType.slice(0, 2) + 'T' + primaryType.slice(3))
    );
  }
  if (closeToZero.jp) {
    types.push(
      (primaryType.slice(0, 3) + 'P'),
      (primaryType.slice(0, 3) + 'J')
    );
  }
  
  // If we still don't have enough types, add more variations by combining multiple alternates
  if (types.length < 3) {
    // Add combinations of the two most balanced dimensions
    const scores = [
      { dim: 'ei', val: Math.abs(scores.e_i_score) },
      { dim: 'sn', val: Math.abs(scores.s_n_score) },
      { dim: 'tf', val: Math.abs(scores.t_f_score) },
      { dim: 'jp', val: Math.abs(scores.j_p_score) }
    ].sort((a, b) => a.val - b.val);

    const mostBalanced = scores.slice(0, 2).map(s => s.dim);
    if (mostBalanced.includes('ei') && mostBalanced.includes('sn')) {
      types.push(
        ('I' + 'N' + primaryType.slice(2)),
        ('E' + 'N' + primaryType.slice(2))
      );
    }
    if (mostBalanced.includes('sn') && mostBalanced.includes('tf')) {
      types.push(
        (primaryType[0] + 'N' + 'F' + primaryType[3]),
        (primaryType[0] + 'S' + 'F' + primaryType[3])
      );
    }
  }
  
  // Remove duplicates and get top 3 unique types
  const uniqueTypes = Array.from(new Set(types));
  return uniqueTypes.slice(0, 3);
}

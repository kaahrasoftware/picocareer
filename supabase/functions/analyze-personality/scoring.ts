
interface ScoreData {
  score: number;
  reasons: Set<string>;
}

interface Scores {
  [key: string]: ScoreData;
}

export interface ScoringResult {
  careerScores: Scores;
  majorScores: Scores;
  traitEvidence: { [key: string]: Set<string> };
}

export function processAnswers(responses: { [key: string]: string }, mappings: any[]) {
  const careerScores: Scores = {};
  const majorScores: Scores = {};
  const traitEvidence: { [key: string]: Set<string> } = {};

  for (const [questionId, answer] of Object.entries(responses)) {
    const answerStr = String(answer);
    console.log(`Processing answer for question ${questionId}: ${answerStr}`);

    const relevantMappings = mappings.filter(m => {
      const answerMatch = m.answer_value === answerStr;
      console.log(`Comparing mapping answer "${m.answer_value}" with response "${answerStr}": ${answerMatch}`);
      return m.question_id === questionId && answerMatch;
    });

    console.log(`Found ${relevantMappings.length} relevant mappings`);

    for (const mapping of relevantMappings) {
      if (!mapping.recommendation_id && mapping.recommendation_type !== 'trait') continue;

      const reason = `Based on your response to question ${questionId}`;
      
      switch (mapping.recommendation_type) {
        case 'career':
          if (!careerScores[mapping.recommendation_id]) {
            careerScores[mapping.recommendation_id] = { score: 0, reasons: new Set() };
          }
          careerScores[mapping.recommendation_id].score += mapping.weight;
          careerScores[mapping.recommendation_id].reasons.add(reason);
          break;

        case 'major':
          if (!majorScores[mapping.recommendation_id]) {
            majorScores[mapping.recommendation_id] = { score: 0, reasons: new Set() };
          }
          majorScores[mapping.recommendation_id].score += mapping.weight;
          majorScores[mapping.recommendation_id].reasons.add(reason);
          break;

        case 'trait':
          if (!traitEvidence[answerStr]) {
            traitEvidence[answerStr] = new Set();
          }
          traitEvidence[answerStr].add(reason);
          break;
      }
    }
  }

  return { careerScores, majorScores, traitEvidence };
}


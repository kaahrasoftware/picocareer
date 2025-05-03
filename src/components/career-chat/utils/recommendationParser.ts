// Fix the Match type issues in recommendationParser.ts
// Let's replace problematic code that uses the .match() method

// Replace the problematic match pattern with a safer approach
function extractValue(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  if (match && match.length > 0) {
    return match[0];
  }
  return null;
}

// Fix the rest of the code that might be using .match()
// Assuming there are functions like this in the file:

export function parseCareerFromRecommendation(text: string) {
  // Use the safer approach
  const careerMatch = extractValue(text, /Career: ([^\n]+)/);
  if (!careerMatch) return null;
  
  // Process the matched content
  return careerMatch.replace('Career: ', '').trim();
}

export function parseReasoningFromRecommendation(text: string) {
  // Use the safer approach
  const reasoningMatch = extractValue(text, /Reasoning: ([^\n]+)/);
  if (!reasoningMatch || reasoningMatch.length === 0) return null;
  
  // Process the matched content
  return reasoningMatch.replace('Reasoning: ', '').trim();
}

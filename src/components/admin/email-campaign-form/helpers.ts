
/**
 * Generates an array of random unique indexes within a given range
 * @param max The maximum index value (exclusive)
 * @param count Number of random indexes to generate
 * @returns Array of random unique indexes
 */
export function getRandomIndexes(max: number, count: number): number[] {
  const indexes: number[] = [];
  const available = Array.from({ length: max }, (_, i) => i);
  
  // Edge case: requesting as many or more than exist
  if (count >= max) return available;
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    const selected = available.splice(randomIndex, 1)[0];
    indexes.push(selected);
  }
  return indexes;
}

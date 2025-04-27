/**
 * Returns an array of N unique random indexes from 0 to max-1
 */
export function getRandomIndexes(max: number, n: number): number[] {
  if (n >= max) {
    return Array.from({ length: max }, (_, i) => i);
  }
  const results = new Set<number>();
  while (results.size < n) {
    results.add(Math.floor(Math.random() * max));
  }
  return Array.from(results);
}

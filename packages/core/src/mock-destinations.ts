/** Curated mock destination detection — shared by pipeline and mock-data. */
export const CURATED_MOCK_DESTINATION_KEYS = ["tokyo", "osaka"] as const;

export function hasCuratedMockDestination(destination: string): boolean {
  const lower = destination.toLowerCase();
  return CURATED_MOCK_DESTINATION_KEYS.some((key) => lower.includes(key));
}

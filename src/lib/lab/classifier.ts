// Section 4 — deterministic "embedding" via term-frequency vectors + cosine
// similarity. Avoids depending on an external embedding API so the immune
// system demo works reliably offline. Mirrored in
// supabase/functions/lab-redteam/index.ts for the server-side path.

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function termFrequencyVector(text: string): Record<string, number> {
  const tokens = tokenize(text);
  const vector: Record<string, number> = {};
  for (const token of tokens) {
    vector[token] = (vector[token] ?? 0) + 1;
  }
  const magnitude = Math.sqrt(
    Object.values(vector).reduce((sum, v) => sum + v * v, 0),
  );
  if (magnitude > 0) {
    for (const key of Object.keys(vector)) {
      vector[key] /= magnitude;
    }
  }
  return vector;
}

export function cosineSimilarity(
  a: Record<string, number>,
  b: Record<string, number>,
): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  for (const key of keys) {
    dot += (a[key] ?? 0) * (b[key] ?? 0);
  }
  return dot; // vectors are already normalized above
}

export const ATTACK_SIMILARITY_THRESHOLD = 0.32;

export function classifyAgainstBlocklist(
  payload: string,
  blocklistVectors: Record<string, number>[],
): { blocked: boolean; maxSimilarity: number } {
  const payloadVector = termFrequencyVector(payload);
  let maxSimilarity = 0;
  for (const vector of blocklistVectors) {
    const similarity = cosineSimilarity(payloadVector, vector);
    if (similarity > maxSimilarity) maxSimilarity = similarity;
  }
  return { blocked: maxSimilarity >= ATTACK_SIMILARITY_THRESHOLD, maxSimilarity };
}

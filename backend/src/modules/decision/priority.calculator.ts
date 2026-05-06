/**
 * PriorityCalculator — kalkulasi skor prioritas berbasis aturan (rule-based).
 *
 * Digunakan sebagai fallback ketika ML service tidak tersedia.
 * Formula: weighted average dengan bobot Severity 40%, Frequency 35%, Recency 25%.
 */

export interface PriorityInputs {
  severity: number;
  frequency: number;
  recency: number;
}

const WEIGHTS = {
  severity: 0.4,
  frequency: 0.35,
  recency: 0.25,
} as const;

/**
 * Hitung skor prioritas menggunakan weighted average.
 * Semua input dan output dalam skala 0–10.
 */
export function calculatePriority(inputs: PriorityInputs): number {
  const raw =
    inputs.severity * WEIGHTS.severity +
    inputs.frequency * WEIGHTS.frequency +
    inputs.recency * WEIGHTS.recency;

  // Clamp ke [0, 10] dan bulatkan 2 desimal
  return Math.round(Math.min(10, Math.max(0, raw)) * 100) / 100;
}

/**
 * Tentukan label prioritas berdasarkan skor.
 */
export function getPriorityLabel(score: number): 'urgent' | 'medium' | 'low' {
  if (score >= 7.5) return 'urgent';
  if (score >= 4.5) return 'medium';
  return 'low';
}

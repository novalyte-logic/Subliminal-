/**
 * Audio Amplitude Analysis and Ballistic Metering Utilities
 */

/**
 * Calculates Root Mean Square (RMS) amplitude from 8-bit frequency or time-domain data (0-255).
 * Returns normalized value between 0.0 and 1.0.
 */
export function calculateRms(data: Uint8Array): number {
  if (!data || data.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const normalized = data[i] / 255.0;
    sum += normalized * normalized;
  }
  return Math.min(1.0, Math.sqrt(sum / data.length));
}

/**
 * Calculates peak amplitude from 8-bit data (0-255).
 * Returns normalized value between 0.0 and 1.0.
 */
export function calculatePeak(data: Uint8Array): number {
  if (!data || data.length === 0) return 0;
  let max = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] > max) max = data[i];
  }
  return Math.min(1.0, max / 255.0);
}

/**
 * Applies ballistic attack/decay smoothing to avoid jittery meter flickers.
 * attack: speed of meter rising (e.g. 0.7 for fast responsive rise)
 * decay: speed of meter falling (e.g. 0.15 for smooth organic falloff)
 */
export function smoothAmplitude(
  current: number,
  target: number,
  attack: number = 0.65,
  decay: number = 0.15
): number {
  if (target > current) {
    return current + (target - current) * attack;
  } else {
    return current + (target - current) * decay;
  }
}

/**
 * Generates an array of normalized bar heights (0.0 to 1.0) resampled for `barCount` columns.
 */
export function generateBarHeights(
  frequencyData: Uint8Array,
  barCount: number = 16,
  sensitivity: number = 1.2
): number[] {
  const result: number[] = new Array(barCount).fill(0.08); // Baseline 8% height minimum
  if (!frequencyData || frequencyData.length === 0) return result;

  const step = Math.max(1, Math.floor(frequencyData.length / barCount));

  for (let i = 0; i < barCount; i++) {
    let sum = 0;
    let count = 0;
    const startIdx = i * step;
    const endIdx = Math.min(frequencyData.length, startIdx + step);

    for (let j = startIdx; j < endIdx; j++) {
      sum += frequencyData[j] / 255.0;
      count++;
    }

    const avg = count > 0 ? sum / count : 0;
    // Apply logarithmic weighting: lower/mid vocal frequencies get natural boost
    const weighting = 1.0 + Math.sin((i / barCount) * Math.PI) * 0.35;
    const val = Math.min(1.0, Math.max(0.08, avg * sensitivity * weighting));
    result[i] = val;
  }

  return result;
}

/**
 * Converts linear amplitude (0.0 - 1.0) to decibels (-60 dB to 0 dB)
 */
export function amplitudeToDecibels(amp: number): number {
  if (amp <= 0.001) return -60;
  const db = 20 * Math.log10(amp);
  return Math.max(-60, Math.min(0, Math.round(db)));
}

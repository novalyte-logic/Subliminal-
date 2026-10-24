/**
 * Novalyte AI - Binaural Beat & Brainwave Entrainment Engine
 * Provides neuro-acoustic frequency modulation presets for Delta, Theta, Alpha, and Gamma brainwave states.
 */

export type BrainwaveBand = 'delta' | 'theta' | 'alpha' | 'gamma';

export interface BrainwavePreset {
  id: BrainwaveBand;
  name: string;
  hz: number;
  rangeLabel: string;
  state: string;
  targetMechanism: string;
  optimalTime: string;
}

export const BINAURAL_BEAT_PRESETS: BrainwavePreset[] = [
  {
    id: 'delta',
    name: 'Delta Wave',
    hz: 2.0,
    rangeLabel: '0.5 – 4 Hz',
    state: 'Deep Sleep & Cellular Regeneration',
    targetMechanism: 'Vagal nerve down-regulation, cortisol clearing, nocturnal subconscious integration',
    optimalTime: 'Sleep onset, late evening, restorative naps',
  },
  {
    id: 'theta',
    name: 'Theta Wave',
    hz: 4.5,
    rangeLabel: '4 – 8 Hz',
    state: 'Hypnagogic Gateway & Subconscious Receptivity',
    targetMechanism: 'Bypasses the conscious critical filter; unlocks direct neuromuscular belief reprogramming',
    optimalTime: 'Deep manifestation, quantum leaping, pre-sleep',
  },
  {
    id: 'alpha',
    name: 'Alpha Wave (Schumann)',
    hz: 7.83,
    rangeLabel: '8 – 12 Hz',
    state: 'Schumann Resonance & Relaxed Alert Flow',
    targetMechanism: 'Synchronizes neuro-electrical activity with Earth geomagnetic frequency; dissolves anxiety',
    optimalTime: 'Morning priming, creative focus, daily calibration',
  },
  {
    id: 'gamma',
    name: 'Gamma Wave',
    hz: 40.0,
    rangeLabel: '30 – 50 Hz',
    state: 'Peak Cognitive Binding & Quantum Epiphanies',
    targetMechanism: '40Hz thalamocortical oscillatory coherence; enhances neural binding and sudden clarity',
    optimalTime: 'High-intensity transcendence, peak strategic thought',
  },
];

/**
 * Calculates stereo ear frequencies for true binaural beating.
 */
export function calculateBinauralFrequencies(
  carrierHz: number,
  beatHz: number
): {
  leftHz: number;
  rightHz: number;
  beatHz: number;
  subOctaveHz: number;
} {
  const safeCarrier = Math.max(20, carrierHz);
  const safeBeat = Math.max(0.1, beatHz);

  // Left ear carries fundamental; Right ear carries fundamental + beat difference
  const leftHz = safeCarrier;
  const rightHz = safeCarrier + safeBeat;
  const subOctaveHz = safeCarrier / 2;

  return {
    leftHz: Number(leftHz.toFixed(2)),
    rightHz: Number(rightHz.toFixed(2)),
    beatHz: Number(safeBeat.toFixed(2)),
    subOctaveHz: Number(subOctaveHz.toFixed(2)),
  };
}

/**
 * Retrieves preset by ID with safe fallback to Theta.
 */
export function getBrainwavePreset(id: BrainwaveBand | string): BrainwavePreset {
  const found = BINAURAL_BEAT_PRESETS.find((p) => p.id === id);
  return found || BINAURAL_BEAT_PRESETS[1]; // default Theta
}

/**
 * Formats user-facing binaural summary text.
 */
export function formatBinauralSummary(carrierHz: number, beatHz: number): string {
  return `${carrierHz}Hz Carrier • ${beatHz}Hz Binaural Difference (L: ${carrierHz}Hz / R: ${(carrierHz + beatHz).toFixed(1)}Hz)`;
}

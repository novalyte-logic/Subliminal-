/**
 * Heart Rate Variability (HRV) Resonance & Breath Sync Logic
 * Provides cardiovascular respiratory sinus arrhythmia (RSA) calculations,
 * dynamic breath cycle pacing, and Solfeggio LFO modulation synchronization.
 */

export interface HrvPreset {
  bpm: number;
  label: string;
  subtext: string;
  coherenceScore: number; // 0 to 100 physiological coherence index
  targetVagalState: string;
}

export const HRV_PRESETS: HrvPreset[] = [
  {
    bpm: 4.5,
    label: '4.5 BPM',
    subtext: 'Deep Vagal Reset',
    coherenceScore: 92,
    targetVagalState: 'Deep parasympathetic down-regulation & restorative slow-wave sleep',
  },
  {
    bpm: 5.5,
    label: '5.5 BPM',
    subtext: 'Optimal Coherence',
    coherenceScore: 98,
    targetVagalState: 'Maximal heart rate variability (0.1 Hz baroreflex resonance)',
  },
  {
    bpm: 6.0,
    label: '6.0 BPM',
    subtext: 'Resonance Baseline',
    coherenceScore: 95,
    targetVagalState: 'Classical 10-second respiratory sinus arrhythmia alignment',
  },
  {
    bpm: 7.5,
    label: '7.5 BPM',
    subtext: 'Balanced Energy',
    coherenceScore: 84,
    targetVagalState: 'Alert cognitive focus and daytime emotional equilibrium',
  },
];

export interface DynamicBreathTiming {
  bpm: number;
  totalCycleSeconds: number;
  totalCycleMs: number;
  lfoFrequencyHz: number;
  inhaleMs: number;
  holdMs: number;
  exhaleMs: number;
  stillnessMs: number;
}

/**
 * Calculates phase breakdown from a target BPM.
 * Uses a baroreflex-optimized 40% Inhale / 10% Hold / 40% Exhale / 10% Stillness ratio.
 */
export function calculateHrvBreathTiming(bpm: number): DynamicBreathTiming {
  const clampedBpm = Math.max(3.0, Math.min(15.0, bpm));
  const totalCycleSeconds = 60 / clampedBpm;
  const totalCycleMs = totalCycleSeconds * 1000;
  const lfoFrequencyHz = clampedBpm / 60;

  // 4:1:4:1 proportional ratio for physiological resonance
  const inhaleMs = totalCycleMs * 0.4;
  const holdMs = totalCycleMs * 0.1;
  const exhaleMs = totalCycleMs * 0.4;
  const stillnessMs = totalCycleMs * 0.1;

  return {
    bpm: clampedBpm,
    totalCycleSeconds,
    totalCycleMs,
    lfoFrequencyHz,
    inhaleMs,
    holdMs,
    exhaleMs,
    stillnessMs,
  };
}

export type HrvBreathPhase = 'inhale' | 'hold' | 'exhale' | 'stillness';

export interface HrvLiveState {
  phase: HrvBreathPhase;
  phaseProgress: number; // 0.0 to 1.0 within phase
  cycleProgress: number; // 0.0 to 1.0 within total cycle
  label: string;
  guidanceText: string;
  orbScale: number; // 0.8 (resting) to 1.35 (peak)
  glowOpacity: number;
  coherenceSinValue: number; // -1.0 to 1.0 smooth sine wave for visualizer
}

/**
 * Computes live HRV breath phase and orb scaling given elapsed time and target BPM.
 */
export function getHrvLiveState(elapsedMs: number, bpm: number = 5.5): HrvLiveState {
  const timing = calculateHrvBreathTiming(bpm);
  const normalizedMs = ((elapsedMs % timing.totalCycleMs) + timing.totalCycleMs) % timing.totalCycleMs;
  const cycleProgress = normalizedMs / timing.totalCycleMs;
  const coherenceSinValue = Math.sin(cycleProgress * 2 * Math.PI);

  if (normalizedMs < timing.inhaleMs) {
    const phaseProgress = normalizedMs / timing.inhaleMs;
    const orbScale = 0.8 + phaseProgress * 0.55;
    return {
      phase: 'inhale',
      phaseProgress,
      cycleProgress,
      label: 'Inhale...',
      guidanceText: `Expanding diaphragm & drawing resonant Solfeggio carrier (${bpm} BPM)`,
      orbScale,
      glowOpacity: 0.35 + phaseProgress * 0.45,
      coherenceSinValue,
    };
  } else if (normalizedMs < timing.inhaleMs + timing.holdMs) {
    const phaseProgress = (normalizedMs - timing.inhaleMs) / timing.holdMs;
    return {
      phase: 'hold',
      phaseProgress,
      cycleProgress,
      label: 'Hold Still...',
      guidanceText: 'Cellular quantum lock & heart rate baroreflex stabilization',
      orbScale: 1.35,
      glowOpacity: 0.8,
      coherenceSinValue,
    };
  } else if (normalizedMs < timing.inhaleMs + timing.holdMs + timing.exhaleMs) {
    const phaseProgress = (normalizedMs - (timing.inhaleMs + timing.holdMs)) / timing.exhaleMs;
    const orbScale = 1.35 - phaseProgress * 0.55;
    return {
      phase: 'exhale',
      phaseProgress,
      cycleProgress,
      label: 'Exhale...',
      guidanceText: 'Releasing vagal tone & dissolving subconscious resistance',
      orbScale,
      glowOpacity: 0.8 - phaseProgress * 0.45,
      coherenceSinValue,
    };
  } else {
    const phaseProgress = (normalizedMs - (timing.inhaleMs + timing.holdMs + timing.exhaleMs)) / timing.stillnessMs;
    return {
      phase: 'stillness',
      phaseProgress,
      cycleProgress,
      label: 'Zero-Point...',
      guidanceText: 'Absolute physiological rest at zero-point cardiac resonance',
      orbScale: 0.8,
      glowOpacity: 0.35,
      coherenceSinValue,
    };
  }
}

/**
 * Calculates estimated physiological coherence percentage based on proximity to 5.5 BPM.
 */
export function calculateCoherenceScore(bpm: number): number {
  // Peak at 5.5 BPM (baroreflex 0.1 Hz)
  const deviation = Math.abs(bpm - 5.5);
  const score = Math.max(50, Math.round(100 - (deviation * 12)));
  return Math.min(100, score);
}

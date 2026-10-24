/**
 * Quantum Sleep Timer & Breath Cycle Utilities
 * Decoupled pure logic for sleep countdowns, soft volume fadeouts, and synchronized Solfeggio breath cycles.
 */

export interface SleepTimerPreset {
  minutes: number;
  label: string;
  subtext: string;
  recommendedFor: string;
}

export const SLEEP_TIMER_PRESETS: SleepTimerPreset[] = [
  {
    minutes: 15,
    label: '15 Min',
    subtext: 'Power Priming',
    recommendedFor: 'Afternoon reset & subconscious alignment',
  },
  {
    minutes: 30,
    label: '30 Min',
    subtext: 'Sleep Onset',
    recommendedFor: 'Falling asleep with continuous affirmation loops',
  },
  {
    minutes: 45,
    label: '45 Min',
    subtext: 'Deep Theta',
    recommendedFor: 'Transition into deep slow-wave sleep',
  },
  {
    minutes: 60,
    label: '60 Min',
    subtext: 'Full Immersion',
    recommendedFor: 'Nightly manifestation & neuroplasticity lock',
  },
  {
    minutes: 90,
    label: '90 Min',
    subtext: 'Full Sleep Cycle',
    recommendedFor: 'Complete ultradian REM + deep delta loop',
  },
];

/**
 * Formats countdown seconds into human readable "MM:SS" or "H:MM:SS"
 */
export function formatSleepCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculates volume multiplier (0.0 to 1.0) during final fade window.
 * Default fade window: 60 seconds.
 * Over the last 60 seconds, smoothly ramps from 1.0 down to 0.0 so sleeper is never jarred awake.
 */
export function calculateFadeVolumeFactor(
  remainingSeconds: number,
  fadeWindowSeconds: number = 60
): number {
  if (remainingSeconds <= 0) return 0;
  if (remainingSeconds >= fadeWindowSeconds) return 1.0;
  // Smooth cosine s-curve fade
  const progress = remainingSeconds / fadeWindowSeconds; // 1.0 -> 0.0
  return 0.5 * (1 - Math.cos(progress * Math.PI));
}

export type BreathPhaseType = 'inhale' | 'hold' | 'exhale' | 'stillness';

export interface BreathPhaseState {
  phase: BreathPhaseType;
  progress: number; // 0.0 to 1.0 within phase
  label: string;
  guidanceText: string;
  orbScale: number; // 0.8 (resting) to 1.35 (expanded)
  glowOpacity: number;
}

export const BREATH_CYCLE_MS = {
  inhale: 4000, // 4 sec Inhale
  hold: 2000, // 2 sec Cellular Lock Hold
  exhale: 4000, // 4 sec Exhale Release
  stillness: 2000, // 2 sec Zero-Point Stillness
  total: 12000, // 12-second quantum coherent breathing cycle
};

/**
 * Computes current breath phase, scale, and guidance text from elapsed milliseconds in cycle.
 */
export function getBreathPhase(elapsedMsInCycle: number): BreathPhaseState {
  const normalizedMs = ((elapsedMsInCycle % BREATH_CYCLE_MS.total) + BREATH_CYCLE_MS.total) % BREATH_CYCLE_MS.total;

  if (normalizedMs < BREATH_CYCLE_MS.inhale) {
    // Inhale: 0 -> 4000ms
    const progress = normalizedMs / BREATH_CYCLE_MS.inhale;
    const orbScale = 0.8 + progress * 0.55; // 0.8 -> 1.35
    return {
      phase: 'inhale',
      progress,
      label: 'Inhale...',
      guidanceText: 'Drawing Solfeggio frequency into heart & lungs',
      orbScale,
      glowOpacity: 0.35 + progress * 0.45,
    };
  } else if (normalizedMs < BREATH_CYCLE_MS.inhale + BREATH_CYCLE_MS.hold) {
    // Hold: 4000ms -> 6000ms
    const progress = (normalizedMs - BREATH_CYCLE_MS.inhale) / BREATH_CYCLE_MS.hold;
    return {
      phase: 'hold',
      progress,
      label: 'Hold...',
      guidanceText: 'Locking cellular resonance & timeline coordinate',
      orbScale: 1.35,
      glowOpacity: 0.8,
    };
  } else if (normalizedMs < BREATH_CYCLE_MS.inhale + BREATH_CYCLE_MS.hold + BREATH_CYCLE_MS.exhale) {
    // Exhale: 6000ms -> 10000ms
    const progress = (normalizedMs - (BREATH_CYCLE_MS.inhale + BREATH_CYCLE_MS.hold)) / BREATH_CYCLE_MS.exhale;
    const orbScale = 1.35 - progress * 0.55; // 1.35 -> 0.8
    return {
      phase: 'exhale',
      progress,
      label: 'Exhale...',
      guidanceText: 'Dissolving resistance into zero-point field',
      orbScale,
      glowOpacity: 0.8 - progress * 0.45,
    };
  } else {
    // Stillness: 10000ms -> 12000ms
    const progress = (normalizedMs - (BREATH_CYCLE_MS.inhale + BREATH_CYCLE_MS.hold + BREATH_CYCLE_MS.exhale)) / BREATH_CYCLE_MS.stillness;
    return {
      phase: 'stillness',
      progress,
      label: 'Stillness...',
      guidanceText: 'Pure observer stillness at zero-point',
      orbScale: 0.8,
      glowOpacity: 0.3,
    };
  }
}

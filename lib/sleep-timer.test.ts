import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatSleepCountdown,
  calculateFadeVolumeFactor,
  getBreathPhase,
  SLEEP_TIMER_PRESETS,
  BREATH_CYCLE_MS,
} from './sleep-timer';

test('formatSleepCountdown formats minutes and hours cleanly', () => {
  assert.equal(formatSleepCountdown(0), '00:00');
  assert.equal(formatSleepCountdown(59), '00:59');
  assert.equal(formatSleepCountdown(60), '01:00');
  assert.equal(formatSleepCountdown(900), '15:00');
  assert.equal(formatSleepCountdown(3600), '1:00:00');
  assert.equal(formatSleepCountdown(5400), '1:30:00');
});

test('calculateFadeVolumeFactor handles full volume, smooth ramp, and zero volume', () => {
  // Above fade window: 1.0 (no attenuation)
  assert.equal(calculateFadeVolumeFactor(120, 60), 1.0);
  assert.equal(calculateFadeVolumeFactor(60, 60), 1.0);

  // Expired: 0.0
  assert.equal(calculateFadeVolumeFactor(0, 60), 0.0);
  assert.equal(calculateFadeVolumeFactor(-5, 60), 0.0);

  // Midway through fade window (30s remaining out of 60s): ~0.5
  const midFade = calculateFadeVolumeFactor(30, 60);
  assert.ok(Math.abs(midFade - 0.5) < 0.05);

  // Monotonically decreasing
  const at45s = calculateFadeVolumeFactor(45, 60);
  const at15s = calculateFadeVolumeFactor(15, 60);
  assert.ok(at45s > midFade);
  assert.ok(midFade > at15s);
  assert.ok(at15s > 0);
});

test('SLEEP_TIMER_PRESETS includes 15m, 30m, 45m, 60m, 90m options', () => {
  const minutes = SLEEP_TIMER_PRESETS.map((p) => p.minutes);
  assert.deepEqual(minutes, [15, 30, 45, 60, 90]);
});

test('getBreathPhase cycles through Inhale -> Hold -> Exhale -> Stillness in 12s rhythm', () => {
  // 1s into cycle: Inhale
  const inhaleState = getBreathPhase(1000);
  assert.equal(inhaleState.phase, 'inhale');
  assert.ok(inhaleState.orbScale >= 0.8 && inhaleState.orbScale <= 1.35);

  // 4.5s into cycle: Hold
  const holdState = getBreathPhase(4500);
  assert.equal(holdState.phase, 'hold');
  assert.equal(holdState.orbScale, 1.35);

  // 7s into cycle: Exhale
  const exhaleState = getBreathPhase(7000);
  assert.equal(exhaleState.phase, 'exhale');
  assert.ok(exhaleState.orbScale <= 1.35 && exhaleState.orbScale >= 0.8);

  // 11s into cycle: Stillness
  const stillnessState = getBreathPhase(11000);
  assert.equal(stillnessState.phase, 'stillness');
  assert.equal(stillnessState.orbScale, 0.8);

  // Wraps gracefully after 12s
  const wrappedState = getBreathPhase(13000); // 13s % 12s = 1s = Inhale
  assert.equal(wrappedState.phase, 'inhale');
});

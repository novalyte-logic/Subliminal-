import { test } from 'node:test';
import assert from 'node:assert';
import {
  BINAURAL_BEAT_PRESETS,
  calculateBinauralFrequencies,
  getBrainwavePreset,
  formatBinauralSummary,
} from './binaural-beats';
import { generateRainAudioData } from './rain-generator';

test('BINAURAL_BEAT_PRESETS contains delta, theta, alpha, and gamma bands', () => {
  const ids = BINAURAL_BEAT_PRESETS.map((p) => p.id);
  assert.ok(ids.includes('delta'), 'Includes delta band');
  assert.ok(ids.includes('theta'), 'Includes theta band');
  assert.ok(ids.includes('alpha'), 'Includes alpha band');
  assert.ok(ids.includes('gamma'), 'Includes gamma band');

  const delta = BINAURAL_BEAT_PRESETS.find((p) => p.id === 'delta');
  assert.strictEqual(delta?.hz, 2.0);

  const theta = BINAURAL_BEAT_PRESETS.find((p) => p.id === 'theta');
  assert.strictEqual(theta?.hz, 4.5);

  const alpha = BINAURAL_BEAT_PRESETS.find((p) => p.id === 'alpha');
  assert.strictEqual(alpha?.hz, 7.83);
});

test('calculateBinauralFrequencies computes exact stereo detuning', () => {
  const result = calculateBinauralFrequencies(528, 4.5);
  assert.strictEqual(result.leftHz, 528);
  assert.strictEqual(result.rightHz, 532.5);
  assert.strictEqual(result.beatHz, 4.5);
  assert.strictEqual(result.subOctaveHz, 264);

  // Delta test with 432Hz
  const deltaResult = calculateBinauralFrequencies(432, 2.0);
  assert.strictEqual(deltaResult.leftHz, 432);
  assert.strictEqual(deltaResult.rightHz, 434);
  assert.strictEqual(deltaResult.beatHz, 2.0);
});

test('getBrainwavePreset returns requested preset or fallback', () => {
  const alpha = getBrainwavePreset('alpha');
  assert.strictEqual(alpha.id, 'alpha');

  const fallback = getBrainwavePreset('unknown-band');
  assert.strictEqual(fallback.id, 'theta');
});

test('formatBinauralSummary produces clear user-facing label', () => {
  const label = formatBinauralSummary(888, 7.83);
  assert.ok(label.includes('888Hz Carrier'));
  assert.ok(label.includes('7.83Hz Binaural Difference'));
});

test('generateRainAudioData produces non-empty stereo arrays within valid amplitude range', () => {
  const rain = generateRainAudioData(1, 44100);
  assert.strictEqual(rain.leftChannel.length, 44100);
  assert.strictEqual(rain.rightChannel.length, 44100);

  // Check bounds
  let maxLeft = 0;
  let maxRight = 0;
  for (let i = 0; i < rain.leftChannel.length; i++) {
    maxLeft = Math.max(maxLeft, Math.abs(rain.leftChannel[i]));
    maxRight = Math.max(maxRight, Math.abs(rain.rightChannel[i]));
  }

  assert.ok(maxLeft > 0.001, 'Left channel has non-zero signal');
  assert.ok(maxRight > 0.001, 'Right channel has non-zero signal');
  assert.ok(maxLeft <= 1.0, 'Left channel amplitude is bounded');
  assert.ok(maxRight <= 1.0, 'Right channel amplitude is bounded');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRms,
  calculatePeak,
  smoothAmplitude,
  generateBarHeights,
  amplitudeToDecibels,
} from './amplitude';

test('calculateRms computes proper RMS for quiet and loud signals', () => {
  const silent = new Uint8Array([0, 0, 0, 0]);
  assert.equal(calculateRms(silent), 0);

  const fullScale = new Uint8Array([255, 255, 255, 255]);
  assert.equal(Math.round(calculateRms(fullScale) * 100) / 100, 1.0);

  const mid = new Uint8Array([128, 128, 128, 128]);
  const midRms = calculateRms(mid);
  assert.ok(midRms > 0.49 && midRms < 0.52);
});

test('calculatePeak returns normalized maximum value', () => {
  const data = new Uint8Array([10, 50, 200, 30]);
  const peak = calculatePeak(data);
  assert.ok(Math.abs(peak - (200 / 255)) < 0.01);
});

test('smoothAmplitude applies attack and decay correctly', () => {
  // Attack (target > current)
  const rising = smoothAmplitude(0.2, 0.8, 0.5, 0.1);
  assert.equal(rising, 0.2 + (0.8 - 0.2) * 0.5); // 0.5

  // Decay (target < current)
  const falling = smoothAmplitude(0.8, 0.2, 0.5, 0.1);
  assert.equal(falling, 0.8 + (0.2 - 0.8) * 0.1); // 0.74
});

test('generateBarHeights produces bounded bars array with specified count', () => {
  const data = new Uint8Array(128).fill(150);
  const bars = generateBarHeights(data, 16, 1.0);
  assert.equal(bars.length, 16);
  for (const h of bars) {
    assert.ok(h >= 0.08, 'Maintains minimum baseline height');
    assert.ok(h <= 1.0, 'Does not exceed max height');
  }
});

test('amplitudeToDecibels maps linear 0..1 to realistic dB scale', () => {
  assert.equal(amplitudeToDecibels(1.0), 0);
  assert.equal(amplitudeToDecibels(0.0), -60);
  const half = amplitudeToDecibels(0.5);
  assert.ok(half >= -7 && half <= -5); // ~ -6 dB
});

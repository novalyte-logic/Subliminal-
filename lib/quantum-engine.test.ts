import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeRhythmicCadence,
  stripSubconsciousFriction,
  transmuteDeterministically,
  SOLFEGGIO_FREQUENCIES,
  QUANTUM_PARADIGMS,
} from './quantum-engine';

test('SOLFEGGIO_FREQUENCIES contains standard high-frequency harmonics', () => {
  const frequencies = SOLFEGGIO_FREQUENCIES.map((f) => f.hz);
  assert.ok(frequencies.includes(432));
  assert.ok(frequencies.includes(528));
  assert.ok(frequencies.includes(888));
  assert.ok(frequencies.includes(963));
  assert.equal(SOLFEGGIO_FREQUENCIES.length, 7);
});

test('QUANTUM_PARADIGMS includes 4 core quantum leap modalities', () => {
  assert.ok(QUANTUM_PARADIGMS['timeline-collapse']);
  assert.ok(QUANTUM_PARADIGMS['observer-sovereignty']);
  assert.ok(QUANTUM_PARADIGMS['bio-electric-somatic']);
  assert.ok(QUANTUM_PARADIGMS['multiverse-convergence']);
});

test('stripSubconsciousFriction removes weak wanting/hoping syntax', () => {
  assert.equal(stripSubconsciousFriction('I want to attract infinite abundance'), 'Attract infinite abundance');
  assert.equal(stripSubconsciousFriction('I hope to heal my chronic fatigue'), 'Heal my chronic fatigue');
  assert.equal(stripSubconsciousFriction('I am trying to build confidence'), 'Build confidence');
  assert.equal(stripSubconsciousFriction('I wish to achieve financial freedom'), 'Achieve financial freedom');
});

test('analyzeRhythmicCadence computes words, syllables, and estimated breath cycle duration', () => {
  const text = 'I collapse the quantum wave function of supreme vitality into this physical coordinate now.';
  const cadence = analyzeRhythmicCadence(text);
  assert.ok(cadence.wordCount > 10);
  assert.ok(cadence.syllableCount >= cadence.wordCount);
  assert.ok(cadence.estimatedDurationSeconds >= 5);
  assert.ok(cadence.meterStyle.length > 0);
});

test('transmuteDeterministically generates quantum affirmation with somatic anchor and analysis', () => {
  const raw = 'I want to be rich and attract huge wealth';
  const result = transmuteDeterministically(raw, 'timeline-collapse', 888);

  assert.equal(result.originalText, raw);
  assert.equal(result.frequencyHz, 888);
  assert.equal(result.paradigm, 'timeline-collapse');
  assert.ok(result.quantumText.includes('collapse') || result.quantumText.includes('wealth'));
  assert.ok(result.somaticAnchor.length > 15, 'Has physical somatic anchor cue');
  assert.ok(result.linguisticShiftAnalysis.length > 15, 'Has conscious shift breakdown');
  assert.ok(result.estimatedDurationSeconds > 0);
});

test('transmuteDeterministically supports all 4 paradigms gracefully', () => {
  const paradigms = [
    'timeline-collapse',
    'observer-sovereignty',
    'bio-electric-somatic',
    'multiverse-convergence',
  ] as const;

  for (const p of paradigms) {
    const res = transmuteDeterministically('I want deep inner peace', p, 432);
    assert.ok(res.quantumText.length > 20);
    assert.ok(res.somaticAnchor.length > 10);
    assert.equal(res.paradigm, p);
    assert.equal(res.frequencyHz, 432);
  }
});

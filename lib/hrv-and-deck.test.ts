import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHrvBreathTiming,
  getHrvLiveState,
  calculateCoherenceScore,
  HRV_PRESETS,
} from './hrv-resonance';
import {
  MASTER_QUANTUM_DECK,
  getDailyDeck,
  getRandomDeck,
  deckCardToAffirmationResult,
} from './quantum-deck';

test('calculateHrvBreathTiming computes exact proportional durations', () => {
  // At 6.0 BPM, total cycle is exactly 10 seconds (10,000 ms)
  const timing6 = calculateHrvBreathTiming(6.0);
  assert.equal(timing6.bpm, 6.0);
  assert.equal(timing6.totalCycleSeconds, 10);
  assert.equal(timing6.totalCycleMs, 10000);
  assert.equal(timing6.lfoFrequencyHz, 0.1);
  assert.equal(timing6.inhaleMs, 4000); // 40% of 10s
  assert.equal(timing6.holdMs, 1000); // 10% of 10s
  assert.equal(timing6.exhaleMs, 4000); // 40% of 10s
  assert.equal(timing6.stillnessMs, 1000); // 10% of 10s

  // At 5.0 BPM, total cycle is 12 seconds
  const timing5 = calculateHrvBreathTiming(5.0);
  assert.equal(timing5.totalCycleSeconds, 12);
  assert.equal(timing5.totalCycleMs, 12000);
  assert.equal(timing5.lfoFrequencyHz, 5 / 60);
});

test('calculateHrvBreathTiming clamps extreme BPM values safely', () => {
  const timingTooLow = calculateHrvBreathTiming(1.0);
  assert.equal(timingTooLow.bpm, 3.0);

  const timingTooHigh = calculateHrvBreathTiming(30.0);
  assert.equal(timingTooHigh.bpm, 15.0);
});

test('getHrvLiveState progresses correctly through inhale, hold, exhale, and stillness phases', () => {
  const bpm = 6.0; // 10s cycle: Inhale 0-4s, Hold 4-5s, Exhale 5-9s, Stillness 9-10s

  // 2 seconds in -> Inhale phase halfway
  const stateInhale = getHrvLiveState(2000, bpm);
  assert.equal(stateInhale.phase, 'inhale');
  assert.equal(Math.round(stateInhale.phaseProgress * 100), 50);
  assert.ok(stateInhale.orbScale > 0.8 && stateInhale.orbScale < 1.35);

  // 4.5 seconds in -> Hold phase
  const stateHold = getHrvLiveState(4500, bpm);
  assert.equal(stateHold.phase, 'hold');
  assert.equal(stateHold.orbScale, 1.35);

  // 7 seconds in -> Exhale phase halfway (5s to 9s, 7s is 50%)
  const stateExhale = getHrvLiveState(7000, bpm);
  assert.equal(stateExhale.phase, 'exhale');
  assert.equal(Math.round(stateExhale.phaseProgress * 100), 50);

  // 9.5 seconds in -> Stillness phase
  const stateStillness = getHrvLiveState(9500, bpm);
  assert.equal(stateStillness.phase, 'stillness');
  assert.equal(stateStillness.orbScale, 0.8);
});

test('calculateCoherenceScore awards highest score around 5.5 BPM', () => {
  const optimal = calculateCoherenceScore(5.5);
  assert.equal(optimal, 100);

  const near = calculateCoherenceScore(6.0);
  assert.ok(near >= 90 && near < 100);

  const far = calculateCoherenceScore(10.0);
  assert.ok(far < near);
});

test('HRV_PRESETS has valid presets including optimal 5.5 coherence', () => {
  assert.ok(HRV_PRESETS.length >= 4);
  const optimalPreset = HRV_PRESETS.find((p) => p.bpm === 5.5);
  assert.ok(optimalPreset);
  assert.equal(optimalPreset.label, '5.5 BPM');
});

test('MASTER_QUANTUM_DECK contains diverse cards with valid frequencies and paradigms', () => {
  assert.ok(MASTER_QUANTUM_DECK.length >= 10);
  for (const card of MASTER_QUANTUM_DECK) {
    assert.ok(card.id);
    assert.ok(card.theme);
    assert.ok(card.quantumText.length > 20);
    assert.ok(card.frequencyHz >= 432 && card.frequencyHz <= 963);
    assert.ok(card.recommendedBpm >= 4.0 && card.recommendedBpm <= 8.0);
  }
});

test('getDailyDeck generates consistent deck for the same date', () => {
  const testDate = new Date('2026-10-23T12:00:00Z');
  const deck1 = getDailyDeck(testDate, 7);
  const deck2 = getDailyDeck(testDate, 7);

  assert.equal(deck1.length, 7);
  assert.equal(deck2.length, 7);
  assert.equal(deck1[0].id, deck2[0].id);
  assert.equal(deck1[1].id, deck2[1].id);
});

test('getRandomDeck returns requested count of cards', () => {
  const deck = getRandomDeck(5);
  assert.equal(deck.length, 5);
});

test('deckCardToAffirmationResult maps deck card to valid affirmation result for player', () => {
  const card = MASTER_QUANTUM_DECK[0];
  const result = deckCardToAffirmationResult(card);

  assert.ok(result.id.startsWith('quantum-deck-'));
  assert.equal(result.quantumText, card.quantumText);
  assert.equal(result.frequencyHz, card.frequencyHz);
  assert.equal(result.paradigm, card.paradigm);
  assert.equal(result.voiceName, 'Kore');
});

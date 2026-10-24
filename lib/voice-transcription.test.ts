import { test } from 'node:test';
import assert from 'node:assert';
import {
  isValidAudioMimeType,
  normalizeAudioMimeType,
  isAudioFileSizeWithinLimit,
  formatAudioDuration,
  cleanTranscribedAffirmation,
  recommendParadigmForAffirmation,
} from './voice-transcription';

test('isValidAudioMimeType recognizes supported audio MIME types and file extensions', () => {
  assert.strictEqual(isValidAudioMimeType('audio/webm'), true);
  assert.strictEqual(isValidAudioMimeType('audio/webm;codecs=opus'), true);
  assert.strictEqual(isValidAudioMimeType('audio/wav'), true);
  assert.strictEqual(isValidAudioMimeType('audio/mp3'), true);
  assert.strictEqual(isValidAudioMimeType('audio/m4a'), true);
  assert.strictEqual(isValidAudioMimeType('audio/ogg'), true);
  assert.strictEqual(isValidAudioMimeType('', 'my-voice.wav'), true);
  assert.strictEqual(isValidAudioMimeType('', 'affirmation.mp3'), true);
  assert.strictEqual(isValidAudioMimeType('video/mp4'), false);
  assert.strictEqual(isValidAudioMimeType('image/png'), false);
  assert.strictEqual(isValidAudioMimeType('', 'notes.txt'), false);
});

test('normalizeAudioMimeType resolves clean MIME type for Gemini API', () => {
  assert.strictEqual(normalizeAudioMimeType('audio/webm;codecs=opus'), 'audio/webm');
  assert.strictEqual(normalizeAudioMimeType('audio/x-wav'), 'audio/wav');
  assert.strictEqual(normalizeAudioMimeType('audio/mpeg'), 'audio/mp3');
  assert.strictEqual(normalizeAudioMimeType('audio/x-m4a'), 'audio/m4a');
  assert.strictEqual(normalizeAudioMimeType('', 'voice.ogg'), 'audio/ogg');
});

test('isAudioFileSizeWithinLimit accurately enforces size caps', () => {
  const tenMb = 10 * 1024 * 1024;
  const thirtyMb = 30 * 1024 * 1024;
  assert.strictEqual(isAudioFileSizeWithinLimit(tenMb, 25), true);
  assert.strictEqual(isAudioFileSizeWithinLimit(thirtyMb, 25), false);
  assert.strictEqual(isAudioFileSizeWithinLimit(0, 25), false);
});

test('formatAudioDuration formats seconds into readable MM:SS', () => {
  assert.strictEqual(formatAudioDuration(0), '0:00');
  assert.strictEqual(formatAudioDuration(9), '0:09');
  assert.strictEqual(formatAudioDuration(65), '1:05');
  assert.strictEqual(formatAudioDuration(134), '2:14');
});

test('cleanTranscribedAffirmation cleans disfluencies and normalizes punctuation', () => {
  const raw1 = 'um, I want to uh stop stressing about money and have freedom';
  const cleaned1 = cleanTranscribedAffirmation(raw1);
  assert.strictEqual(cleaned1, 'I want to stop stressing about money and have freedom.');

  const raw2 = '"like you know I am ready to step into my highest power"';
  const cleaned2 = cleanTranscribedAffirmation(raw2);
  assert.strictEqual(cleaned2, 'I am ready to step into my highest power.');
});

test('recommendParadigmForAffirmation routes semantic intent to correct Quantum Leap paradigm', () => {
  assert.strictEqual(
    recommendParadigmForAffirmation('I want to heal my chronic fatigue and restore cellular energy'),
    'bio-electric-somatic'
  );
  assert.strictEqual(
    recommendParadigmForAffirmation('I want to quantum leap into the highest parallel version of me'),
    'multiverse-convergence'
  );
  assert.strictEqual(
    recommendParadigmForAffirmation('I want immediate financial abundance and no more delays'),
    'timeline-collapse'
  );
  assert.strictEqual(
    recommendParadigmForAffirmation('I decree my unshakeable command and sovereign leadership'),
    'observer-sovereignty'
  );
});

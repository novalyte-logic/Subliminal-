import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeWav, base64ToUint8Array } from './wav-export';

test('encodeWav creates valid RIFF/WAVE 16-bit PCM stereo header', () => {
  const sampleRate = 44100;
  const numSamples = 100;
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  // Fill with dummy sine values
  for (let i = 0; i < numSamples; i++) {
    left[i] = Math.sin((i / 100) * Math.PI * 2);
    right[i] = Math.cos((i / 100) * Math.PI * 2);
  }

  const wavBytes = encodeWav(left, right, sampleRate);
  assert.ok(wavBytes instanceof Uint8Array);

  // Total size: 44 header bytes + 100 samples * 2 channels * 2 bytes = 44 + 400 = 444 bytes
  assert.equal(wavBytes.length, 444);

  const view = new DataView(wavBytes.buffer);

  // 1. RIFF marker
  const riff = String.fromCharCode(wavBytes[0], wavBytes[1], wavBytes[2], wavBytes[3]);
  assert.equal(riff, 'RIFF');

  // 2. WAVE marker
  const wave = String.fromCharCode(wavBytes[8], wavBytes[9], wavBytes[10], wavBytes[11]);
  assert.equal(wave, 'WAVE');

  // 3. 'fmt ' marker
  const fmt = String.fromCharCode(wavBytes[12], wavBytes[13], wavBytes[14], wavBytes[15]);
  assert.equal(fmt, 'fmt ');

  // 4. Format parameters
  assert.equal(view.getUint16(20, true), 1); // PCM = 1
  assert.equal(view.getUint16(22, true), 2); // Stereo = 2
  assert.equal(view.getUint32(24, true), sampleRate); // Sample rate 44100
  assert.equal(view.getUint32(28, true), sampleRate * 4); // Byte rate
  assert.equal(view.getUint16(32, true), 4); // Block align (2ch * 2 bytes)
  assert.equal(view.getUint16(34, true), 16); // 16-bit PCM

  // 5. 'data' marker
  const data = String.fromCharCode(wavBytes[36], wavBytes[37], wavBytes[38], wavBytes[39]);
  assert.equal(data, 'data');
  assert.equal(view.getUint32(40, true), 400); // 400 bytes data
});

test('encodeWav clamps loud audio without 16-bit integer overflow', () => {
  const left = new Float32Array([1.5, -2.0, 0.0, 0.5]);
  const right = new Float32Array([1.5, -2.0, 0.0, -0.5]);

  const wavBytes = encodeWav(left, right, 44100);
  const view = new DataView(wavBytes.buffer);

  // First sample: clamped to max positive 32767
  const firstLeft = view.getInt16(44, true);
  assert.equal(firstLeft, 32767);

  // Second sample: clamped to min negative -32768
  const secondLeft = view.getInt16(48, true);
  assert.equal(secondLeft, -32768);
});

test('base64ToUint8Array properly decodes base64 strings', () => {
  // 'Hello' in base64 is 'SGVsbG8='
  const decoded = base64ToUint8Array('SGVsbG8=');
  const str = String.fromCharCode(...decoded);
  assert.equal(str, 'Hello');
});

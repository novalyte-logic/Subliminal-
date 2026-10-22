/**
 * Novalyte AI - Quantum Audio Master WAV Exporter
 * Pure WAV encoder and OfflineAudioContext compositor for combined Voice + Solfeggio Carrier Tone.
 */

export interface MasterMixOptions {
  voiceBase64Wav?: string;
  frequencyHz: number;
  binauralDifference?: number;
  voiceVolume?: number;
  carrierVolume?: number;
  includeVoice?: boolean;
  includeCarrier?: boolean;
  repeatCount?: number; // e.g. 1, 3, or 5 loops
  sampleRate?: number;
  estimatedDurationSeconds?: number;
}

/**
 * Encodes stereo or mono Float32Array channel data into standard 16-bit PCM RIFF WAV format.
 */
export function encodeWav(
  leftChannel: Float32Array,
  rightChannel: Float32Array | null,
  sampleRate: number = 44100
): Uint8Array {
  const isStereo = rightChannel !== null && rightChannel.length > 0;
  const numChannels = isStereo ? 2 : 1;
  const numSamples = leftChannel.length;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const bufferSize = 44 + dataSize;

  const buffer = new Uint8Array(bufferSize);
  const view = new DataView(buffer.buffer);

  // Write ASCII helper
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 1. RIFF Header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // File size - 8
  writeString(8, 'WAVE');

  // 2. 'fmt ' subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true); // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // 3. 'data' subchunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // 4. Interleaved 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    // Left channel
    const leftVal = Math.max(-1, Math.min(1, leftChannel[i]));
    const leftInt = leftVal < 0 ? leftVal * 0x8000 : leftVal * 0x7fff;
    view.setInt16(offset, leftInt, true);
    offset += 2;

    // Right channel (if stereo)
    if (isStereo && rightChannel) {
      const rightVal = Math.max(-1, Math.min(1, rightChannel[i]));
      const rightInt = rightVal < 0 ? rightVal * 0x8000 : rightVal * 0x7fff;
      view.setInt16(offset, rightInt, true);
      offset += 2;
    }
  }

  return buffer;
}

/**
 * Decodes base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Renders the combined Voice + Solfeggio Carrier Tone into a master 16-bit Stereo WAV Blob.
 * Runs in browser environment via OfflineAudioContext.
 */
export async function renderMasterWav(options: MasterMixOptions): Promise<{
  blob: Blob;
  durationSeconds: number;
  sampleRate: number;
}> {
  if (typeof window === 'undefined') {
    throw new Error('renderMasterWav can only be executed in a browser environment');
  }

  const sampleRate = options.sampleRate || 44100;
  const repeatCount = Math.max(1, options.repeatCount || 1);
  const voiceVolume = options.includeVoice === false ? 0 : options.voiceVolume ?? 0.95;
  const carrierVolume = options.includeCarrier === false ? 0 : options.carrierVolume ?? 0.25;
  const frequencyHz = options.frequencyHz || 528;
  const binauralDiff = options.binauralDifference ?? 7.83; // Default Schumann resonance

  // Initialize temporary audio context for decoding voice if needed
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const tempCtx = new AudioCtx();

  let voiceBuffer: AudioBuffer | null = null;

  if (options.voiceBase64Wav && voiceVolume > 0) {
    try {
      const wavBytes = base64ToUint8Array(options.voiceBase64Wav);
      const arrayBuffer = new ArrayBuffer(wavBytes.byteLength);
      new Uint8Array(arrayBuffer).set(wavBytes);
      voiceBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn('Failed to decode voice WAV bytes in temp context:', e);
    }
  }

  await tempCtx.close();

  // Determine base duration
  const singleVoiceDuration = voiceBuffer ? voiceBuffer.duration : options.estimatedDurationSeconds || 12;
  const pauseBetweenRepeats = 2.5; // Breath silence between repeats
  const totalDuration = (singleVoiceDuration * repeatCount) + (pauseBetweenRepeats * (repeatCount - 1)) + 2.0; // +2s tail fade out
  const totalSamples = Math.ceil(totalDuration * sampleRate);

  // Create OfflineAudioContext (Stereo 2-channels for true binaural detuning)
  const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const offlineCtx = new OfflineCtx(2, totalSamples, sampleRate);

  // 1. Synthesize Solfeggio Carrier Bed (Left + Right with Binaural difference)
  if (carrierVolume > 0) {
    const carrierMasterGain = offlineCtx.createGain();
    carrierMasterGain.gain.setValueAtTime(0.0001, 0);
    // Smooth fade in over 1.5 seconds
    carrierMasterGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, carrierVolume), 1.5);
    // Smooth fade out at the end
    carrierMasterGain.gain.setValueAtTime(carrierVolume, Math.max(1.5, totalDuration - 2.0));
    carrierMasterGain.gain.exponentialRampToValueAtTime(0.0001, totalDuration);

    // Left Channel: Fundamental Hz + Sub-harmonic
    const oscLeft = offlineCtx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(frequencyHz, 0);

    const subOscLeft = offlineCtx.createOscillator();
    subOscLeft.type = 'sine';
    subOscLeft.frequency.setValueAtTime(frequencyHz / 2, 0);

    const subGainLeft = offlineCtx.createGain();
    subGainLeft.gain.setValueAtTime(0.3, 0);
    subOscLeft.connect(subGainLeft);

    // Right Channel: Fundamental + Binaural difference (e.g. 528Hz + 7.83Hz = 535.83Hz)
    const oscRight = offlineCtx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(frequencyHz + binauralDiff, 0);

    const subOscRight = offlineCtx.createOscillator();
    subOscRight.type = 'sine';
    subOscRight.frequency.setValueAtTime((frequencyHz + binauralDiff) / 2, 0);

    const subGainRight = offlineCtx.createGain();
    subGainRight.gain.setValueAtTime(0.3, 0);
    subOscRight.connect(subGainRight);

    // Gentle LFO for 0.12Hz rhythmic breath amplitude pulsation
    const lfo = offlineCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, 0);

    const lfoGain = offlineCtx.createGain();
    lfoGain.gain.setValueAtTime(0.15, 0);
    lfo.connect(lfoGain);

    // Channel Merger for true stereo binaural entrainment
    const merger = offlineCtx.createChannelMerger(2);

    const leftMix = offlineCtx.createGain();
    oscLeft.connect(leftMix);
    subGainLeft.connect(leftMix);
    leftMix.connect(merger, 0, 0); // Left channel

    const rightMix = offlineCtx.createGain();
    oscRight.connect(rightMix);
    subGainRight.connect(rightMix);
    rightMix.connect(merger, 0, 1); // Right channel

    merger.connect(carrierMasterGain);
    carrierMasterGain.connect(offlineCtx.destination);

    // Start all carrier nodes
    oscLeft.start(0);
    subOscLeft.start(0);
    oscRight.start(0);
    subOscRight.start(0);
    lfo.start(0);

    oscLeft.stop(totalDuration);
    subOscLeft.stop(totalDuration);
    oscRight.stop(totalDuration);
    subOscRight.stop(totalDuration);
    lfo.stop(totalDuration);
  }

  // 2. Position Voice Audio in the mix (repeating as requested)
  if (voiceBuffer && voiceVolume > 0) {
    let currentStartTime = 0.8; // Brief initial lead-in for carrier wave settling

    for (let r = 0; r < repeatCount; r++) {
      const voiceSource = offlineCtx.createBufferSource();
      voiceSource.buffer = voiceBuffer;

      const voiceGain = offlineCtx.createGain();
      voiceGain.gain.setValueAtTime(voiceVolume, currentStartTime);

      voiceSource.connect(voiceGain);
      voiceGain.connect(offlineCtx.destination);

      voiceSource.start(currentStartTime);
      currentStartTime += voiceBuffer.duration + pauseBetweenRepeats;
    }
  }

  // 3. Render Offline Mix
  const renderedBuffer = await offlineCtx.startRendering();

  // 4. Encode to 16-bit PCM RIFF Stereo WAV
  const leftData = renderedBuffer.getChannelData(0);
  const rightData = renderedBuffer.numberOfChannels > 1 ? renderedBuffer.getChannelData(1) : leftData;

  const wavUint8 = encodeWav(leftData, rightData, sampleRate);
  const blob = new Blob([wavUint8.buffer as ArrayBuffer], { type: 'audio/wav' });

  return {
    blob,
    durationSeconds: totalDuration,
    sampleRate,
  };
}

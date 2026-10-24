/**
 * Novalyte AI - Algorithmic Crisp Rainfall Sound Engine
 * Synthesizes organic, seamless, soothing crisp rainfall ambience using
 * pink-filtered Gaussian noise with randomized micro-droplet stereo transients.
 */

export interface RainAudioData {
  leftChannel: Float32Array;
  rightChannel: Float32Array;
  sampleRate: number;
  durationSeconds: number;
}

/**
 * Generates pure stereo Float32Array channel data simulating crisp, soothing rainfall.
 * Can be decoded into Web Audio Buffer or OfflineAudioContext for WAV export.
 */
export function generateRainAudioData(
  durationSeconds: number = 5,
  sampleRate: number = 44100
): RainAudioData {
  const numSamples = Math.floor(durationSeconds * sampleRate);
  const leftChannel = new Float32Array(numSamples);
  const rightChannel = new Float32Array(numSamples);

  // Pink Noise 3-pole state variables (Paul Kellet's filter)
  let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
  let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;

  // Simple High-pass filter state to remove rumble below 350Hz
  let prevInL = 0, prevOutL = 0;
  let prevInR = 0, prevOutR = 0;
  const rc = 1.0 / (2.0 * Math.PI * 350.0);
  const dt = 1.0 / sampleRate;
  const alphaHp = rc / (rc + dt);

  for (let i = 0; i < numSamples; i++) {
    // Generate white noise in range [-1, 1]
    const whiteL = Math.random() * 2 - 1;
    const whiteR = Math.random() * 2 - 1;

    // Pink noise filter algorithm for left channel
    b0L = 0.99886 * b0L + whiteL * 0.0555179;
    b1L = 0.99332 * b1L + whiteL * 0.0750759;
    b2L = 0.96900 * b2L + whiteL * 0.1538520;
    b3L = 0.86650 * b3L + whiteL * 0.3104856;
    b4L = 0.55000 * b4L + whiteL * 0.5329522;
    b5L = -0.7616 * b5L - whiteL * 0.0168980;
    const pinkL = b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362;
    b6L = whiteL * 0.115926;

    // Pink noise filter algorithm for right channel
    b0R = 0.99886 * b0R + whiteR * 0.0555179;
    b1R = 0.99332 * b1R + whiteR * 0.0750759;
    b2R = 0.96900 * b2R + whiteR * 0.1538520;
    b3R = 0.86650 * b3R + whiteR * 0.3104856;
    b4R = 0.55000 * b4R + whiteR * 0.5329522;
    b5R = -0.7616 * b5R - whiteR * 0.0168980;
    const pinkR = b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362;
    b6R = whiteR * 0.115926;

    // Apply High-pass filter to keep rain crisp and airy
    const hpL = alphaHp * (prevOutL + pinkL - prevInL);
    prevInL = pinkL;
    prevOutL = hpL;

    const hpR = alphaHp * (prevOutR + pinkR - prevInR);
    prevInR = pinkR;
    prevOutR = hpR;

    // Subtle gentle droplet sprinkles (random tiny pings)
    let dropletL = 0;
    let dropletR = 0;
    if (Math.random() < 0.0018) {
      const dropAmp = 0.08 + Math.random() * 0.14;
      const pan = Math.random(); // 0 = left, 1 = right
      dropletL = dropAmp * (1 - pan);
      dropletR = dropAmp * pan;
    }

    // Blend base rain hiss with gentle droplet transients (normalized to safe range)
    leftChannel[i] = Math.max(-1, Math.min(1, (hpL * 0.07) + dropletL));
    rightChannel[i] = Math.max(-1, Math.min(1, (hpR * 0.07) + dropletR));
  }

  // Crossfade boundary (first and last 1000 samples) for click-free looping
  const fadeLen = Math.min(1000, Math.floor(numSamples * 0.02));
  for (let i = 0; i < fadeLen; i++) {
    const ratio = i / fadeLen;
    // Blend end of buffer into start
    leftChannel[i] = leftChannel[i] * ratio + leftChannel[numSamples - fadeLen + i] * (1 - ratio);
    rightChannel[i] = rightChannel[i] * ratio + rightChannel[numSamples - fadeLen + i] * (1 - ratio);
  }

  return {
    leftChannel,
    rightChannel,
    sampleRate,
    durationSeconds,
  };
}

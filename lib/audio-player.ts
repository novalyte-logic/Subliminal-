import { generateRainAudioData } from './rain-generator';

export class SolfeggioSynthesizer {
  private ctx: AudioContext | null = null;
  private oscBase: OscillatorNode | null = null;
  private oscBinaural: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private masterGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isRunning = false;
  private currentHz = 528;
  private binauralBeatHz = 7.83;
  private volume = 0.25;

  // Crisp Rainfall Ambience Synthesizer Nodes
  private rainSource: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private isRainRunning = false;
  private rainVolume = 0.25;

  // Heart Rate Variability (HRV) Breathing Resonance Pacing
  private hrvBpm: number = 5.5;
  private hrvSyncEnabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startTone(hz: number, binauralDiff: number = 7.83, volume: number = 0.25) {
    this.initContext();
    if (!this.ctx) return;

    this.stopTone();
    this.currentHz = hz;
    this.binauralBeatHz = binauralDiff;
    this.volume = volume;

    const now = this.ctx.currentTime;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 1.2);

    // Analyser Node for visualizer
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.85;

    // Base Solfeggio Oscillator (Pure Sine)
    this.oscBase = this.ctx.createOscillator();
    this.oscBase.type = 'sine';
    this.oscBase.frequency.setValueAtTime(hz, now);

    // Subtle Harmonic Sub/Overtone
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(hz / 2, now); // 1 octave lower warm foundation

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.3, now);
    this.subOsc.connect(subGain);

    // Binaural Detune Oscillator for Delta/Theta/Alpha Brainwave Entrainment
    this.oscBinaural = this.ctx.createOscillator();
    this.oscBinaural.type = 'sine';
    this.oscBinaural.frequency.setValueAtTime(hz + binauralDiff, now);

    const binauralGain = this.ctx.createGain();
    binauralGain.gain.setValueAtTime(0.35, now);
    this.oscBinaural.connect(binauralGain);

    // Gentle LFO for breathing amplitude pulse dynamically synced to HRV target breathing rate
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    const initialLfoHz = this.hrvSyncEnabled ? (this.hrvBpm / 60) : 0.0917; // 5.5 BPM default = 0.0917 Hz
    this.lfo.frequency.setValueAtTime(initialLfoHz, now);

    this.lfoGain = this.ctx.createGain();
    // Subtly modulate master amplitude (depth 0.15) for organic breathing envelope
    this.lfoGain.gain.setValueAtTime(0.08, now);
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.masterGain.gain);

    // True Stereo Channel Merger for Headphone & Spatial Binaural Entrainment
    // Left ear receives primary Solfeggio carrier tone; Right ear receives detuned tone
    const merger = this.ctx.createChannelMerger(2);

    const leftMix = this.ctx.createGain();
    this.oscBase.connect(leftMix);
    subGain.connect(leftMix);
    leftMix.connect(merger, 0, 0); // Left channel

    const rightMix = this.ctx.createGain();
    this.oscBinaural.connect(rightMix);
    subGain.connect(rightMix);
    rightMix.connect(merger, 0, 1); // Right channel

    merger.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.oscBase.start(now);
    this.subOsc.start(now);
    this.oscBinaural.start(now);
    this.lfo.start(now);

    this.isRunning = true;
  }

  public setHrvSync(enabled: boolean, bpm?: number) {
    this.hrvSyncEnabled = enabled;
    if (bpm !== undefined) {
      this.hrvBpm = bpm;
    }
    if (this.ctx && this.lfo && this.isRunning) {
      const now = this.ctx.currentTime;
      const targetHz = enabled ? (this.hrvBpm / 60) : 0.0917;
      this.lfo.frequency.cancelScheduledValues(now);
      this.lfo.frequency.linearRampToValueAtTime(targetHz, now + 0.3);
      if (this.lfoGain) {
        this.lfoGain.gain.cancelScheduledValues(now);
        this.lfoGain.gain.linearRampToValueAtTime(enabled ? 0.08 : 0.03, now + 0.2);
      }
    }
  }

  public setHrvBpm(bpm: number) {
    this.hrvBpm = Math.max(3.0, Math.min(15.0, bpm));
    if (this.ctx && this.lfo && this.isRunning && this.hrvSyncEnabled) {
      const now = this.ctx.currentTime;
      this.lfo.frequency.cancelScheduledValues(now);
      this.lfo.frequency.linearRampToValueAtTime(this.hrvBpm / 60, now + 0.3);
    }
  }

  public getHrvBpm(): number {
    return this.hrvBpm;
  }

  public getHrvSyncEnabled(): boolean {
    return this.hrvSyncEnabled;
  }

  public setBinauralBeat(beatHz: number) {
    this.binauralBeatHz = beatHz;
    if (this.ctx && this.oscBinaural && this.isRunning) {
      const now = this.ctx.currentTime;
      this.oscBinaural.frequency.cancelScheduledValues(now);
      this.oscBinaural.frequency.exponentialRampToValueAtTime(
        Math.max(10, this.currentHz + beatHz),
        now + 0.3
      );
    }
  }

  public getBinauralBeat(): number {
    return this.binauralBeatHz;
  }

  public setVolume(vol: number) {
    this.volume = vol;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(Math.max(0.0001, vol), now + 0.1);
    }
  }

  public stopTone() {
    if (!this.isRunning || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.masterGain) {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      }
      setTimeout(() => {
        try {
          this.oscBase?.stop();
          this.subOsc?.stop();
          this.oscBinaural?.stop();
          this.lfo?.stop();
          this.oscBase?.disconnect();
          this.subOsc?.disconnect();
          this.oscBinaural?.disconnect();
          this.lfo?.disconnect();
        } catch (e) {
          // ignore cleanup issues
        }
        this.isRunning = false;
      }, 850);
    } catch (e) {
      this.isRunning = false;
    }
  }

  // --- Crisp Rainfall Sound Methods ---

  public startRain(volume: number = 0.25) {
    this.initContext();
    if (!this.ctx) return;
    this.rainVolume = volume;

    if (this.isRainRunning && this.rainGain) {
      const now = this.ctx.currentTime;
      this.rainGain.gain.cancelScheduledValues(now);
      this.rainGain.gain.linearRampToValueAtTime(volume, now + 0.1);
      return;
    }

    this.stopRain();

    try {
      // Synthesize 4-second seamless crisp rain audio buffer
      const rainData = generateRainAudioData(4, this.ctx.sampleRate);
      const audioBuf = this.ctx.createBuffer(2, rainData.leftChannel.length, this.ctx.sampleRate);
      audioBuf.getChannelData(0).set(rainData.leftChannel);
      audioBuf.getChannelData(1).set(rainData.rightChannel);

      const now = this.ctx.currentTime;
      this.rainSource = this.ctx.createBufferSource();
      this.rainSource.buffer = audioBuf;
      this.rainSource.loop = true;

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.0001, now);
      this.rainGain.gain.linearRampToValueAtTime(volume, now + 0.8);

      this.rainSource.connect(this.rainGain);

      const analyser = this.getAnalyser();
      if (analyser) {
        this.rainGain.connect(analyser);
        analyser.connect(this.ctx.destination);
      } else {
        this.rainGain.connect(this.ctx.destination);
      }

      this.rainSource.start(now);
      this.isRainRunning = true;
    } catch (e) {
      console.warn('Could not start rain sound:', e);
    }
  }

  public setRainVolume(vol: number) {
    this.rainVolume = vol;
    if (this.ctx && this.rainGain && this.isRainRunning) {
      const now = this.ctx.currentTime;
      this.rainGain.gain.cancelScheduledValues(now);
      this.rainGain.gain.linearRampToValueAtTime(Math.max(0, vol), now + 0.1);
    }
  }

  public stopRain() {
    if (!this.isRainRunning || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.rainGain) {
        this.rainGain.gain.cancelScheduledValues(now);
        this.rainGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      }
      setTimeout(() => {
        try {
          this.rainSource?.stop();
          this.rainSource?.disconnect();
          this.rainGain?.disconnect();
        } catch (e) {
          // ignore
        }
        this.isRainRunning = false;
      }, 550);
    } catch (e) {
      this.isRainRunning = false;
    }
  }

  public getIsRainPlaying(): boolean {
    return this.isRainRunning;
  }

  public getRainVolume(): number {
    return this.rainVolume;
  }

  private mediaSource: MediaElementAudioSourceNode | null = null;
  private attachedElement: HTMLAudioElement | null = null;

  public attachAudioElement(el: HTMLAudioElement) {
    this.initContext();
    if (!this.ctx || this.attachedElement === el) return;
    this.attachedElement = el;
    try {
      if (!this.mediaSource) {
        this.mediaSource = this.ctx.createMediaElementSource(el);
        const analyser = this.getAnalyser();
        if (analyser) {
          this.mediaSource.connect(analyser);
          analyser.connect(this.ctx.destination);
        } else {
          this.mediaSource.connect(this.ctx.destination);
        }
      }
    } catch (e) {
      // Element may already be connected
    }
  }

  public resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    if (this.ctx && !this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;
    }
    return this.analyser;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getFrequency(): number {
    return this.currentHz;
  }
}

export const globalSolfeggioSynth = new SolfeggioSynthesizer();

// Web Audio API Solfeggio Frequency Tone Generator & Master Audio Manager

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
  private volume = 0.25;

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

    // Binaural Detune Oscillator for Theta/Alpha Brainwave Entrainment
    this.oscBinaural = this.ctx.createOscillator();
    this.oscBinaural.type = 'sine';
    this.oscBinaural.frequency.setValueAtTime(hz + binauralDiff, now);

    const binauralGain = this.ctx.createGain();
    binauralGain.gain.setValueAtTime(0.35, now);
    this.oscBinaural.connect(binauralGain);

    // Gentle LFO for breathing amplitude pulse (0.1 Hz = 10s breath cycle)
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.12, now); // ~8 sec rhythmic breath cycle

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(0.12, now);
    this.lfo.connect(this.lfoGain);

    // Connect voices
    this.oscBase.connect(this.masterGain);
    subGain.connect(this.masterGain);
    binauralGain.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.oscBase.start(now);
    this.subOsc.start(now);
    this.oscBinaural.start(now);
    this.lfo.start(now);

    this.isRunning = true;
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
